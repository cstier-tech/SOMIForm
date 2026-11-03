import type { DefaultValues } from 'react-hook-form'
import { supabase } from '../supabase'
import type { Stage } from './stages'
import type { SomiFormValues } from './types'

export type Decision = 'approve' | 'deny'

// One entry in the comments column
type SomiComment = {
  comment: string
  stage: Stage
  decision: Decision
}

// The columns this app reads and writes
export type SomiRequest = {
  id: string
  created_at: string
  date: string | null
  customer_name: string | null
  customer_number: string | null
  item_name: string | null
  consumption_per_mo: string | null
  sold_at_storefront: boolean | null
  sold_w_kits: boolean | null
  obsolete_of_slow_moving: boolean | null
  customer_signed_agreement: boolean | null
  reorder_points_established: boolean | null
  reorder_point: number | null
  reorder_monitor: string | null
  business_justification: string | null
  process_to_produce: string | null
  outside_purchase: boolean | null
  estimator: string | null
  estimating_system: string | null
  qty_estimated_1mo: number | null
  qty_estimated_2mo: number | null
  qty_estimated_3mo: number | null
  total_direct_manufacturing_cost: string | null
  skids_to_inventory_item: number | null
  qty_est_mo_approved: string | null
  tps_approved: boolean | null
  psi_no: string | null
  veracore_no: string | null
  comments: SomiComment[] | null
}

// The column each form field is saved to. estimateFile and the per-month manufacturing costs have
// no column, so they aren't saved. comments isn't here either: only appendComment writes it, so a
// save can't overwrite it.
const fieldColumns = {
  // Sales
  date: 'date',
  customer: 'customer_name',
  customerNumber: 'customer_number',
  itemName: 'item_name',
  // Text column; Postgres stores the number as text
  monthlyConsumption: 'consumption_per_mo',
  soldAtStorefront: 'sold_at_storefront',
  soldWithKits: 'sold_w_kits',
  understandsObsoleteResponsibility: 'obsolete_of_slow_moving',
  signedSomiAgreement: 'customer_signed_agreement',
  reorderPointsEstablished: 'reorder_points_established',
  reorderPointQuantity: 'reorder_point',
  reorderMonitor: 'reorder_monitor',
  businessJustification: 'business_justification',
  // Manufacturing
  process: 'process_to_produce',
  outsidePurchase: 'outside_purchase',
  // Estimating
  estimator: 'estimator',
  estimatingSystem: 'estimating_system',
  totalDirectManufacturingCost: 'total_direct_manufacturing_cost',
  skidsRequired: 'skids_to_inventory_item',
  // Manufacturing 2
  approvedMonths: 'qty_est_mo_approved',
  // Sales 2
  salesApprovesTsp: 'tps_approved',
  // Accounting
  psiNumber: 'psi_no',
  // Web Support
  veracoreNumber: 'veracore_no',
} as const satisfies Partial<Record<keyof SomiFormValues, keyof SomiRequest>>

// The quantities in quantityEstimated, in order
const quantityColumns = ['qty_estimated_1mo', 'qty_estimated_2mo', 'qty_estimated_3mo'] as const

// Blank inputs arrive as '' or NaN, which date and numeric columns reject
function blankToNull(value: unknown) {
  return value === '' || Number.isNaN(value) ? null : value
}

function toRow(values: DefaultValues<SomiFormValues>) {
  const row: Record<string, unknown> = {}
  for (const [field, column] of Object.entries(fieldColumns)) {
    row[column] = blankToNull(values[field as keyof typeof fieldColumns])
  }
  quantityColumns.forEach((column, index) => {
    row[column] = blankToNull(values.quantityEstimated?.[index]?.quantity)
  })
  return row
}

export function toValues(request: SomiRequest) {
  // Empty columns become undefined, which is what the form uses for "not filled in"
  const values = Object.fromEntries(
    Object.entries(fieldColumns).map(([field, column]) => [field, request[column] ?? undefined]),
  )

  return {
    ...values,
    monthlyConsumption: request.consumption_per_mo ? Number(request.consumption_per_mo) : undefined,
    quantityEstimated: quantityColumns.map((column) => ({
      quantity: request[column] ?? undefined,
    })),
  } as DefaultValues<SomiFormValues>
}

function table() {
  return supabase.from('SOMIRequest')
}

function unwrap<T>(result: { data: T; error: null } | { data: null; error: { message: string } }) {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function fetchRequests(): Promise<SomiRequest[]> {
  return unwrap(await table().select().order('created_at', { ascending: false }))
}

export async function fetchRequest(id: string): Promise<SomiRequest> {
  const data = unwrap(await table().select().eq('id', id).maybeSingle())
  if (!data) throw new Error('No record has that id.')
  return data
}

// An empty column reads back as undefined, which matches a field still left blank
function comparable(value: unknown) {
  return value === undefined ? null : value
}

// Adds to the end of the comments column, along with any other changes to the record, and
// returns the row as stored
export async function appendComment(
  id: string,
  comment: SomiComment,
  changes: object = {},
): Promise<SomiRequest> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { comments } = await fetchRequest(id)
    const update = table()
      .update({ ...changes, comments: [...(comments ?? []), comment] })
      .eq('id', id)

    // Matches no rows if another comment arrived since the read above, so that comment isn't
    // lost; the next attempt adds to it
    const data = unwrap(
      await (comments
        ? update.eq('comments', JSON.stringify(comments))
        : update.is('comments', null)
      ).select(),
    )
    if (data.length) return data[0]
  }

  throw new Error('The comment could not be added. Try again.')
}

// Inserts a new request, or updates the one already saved along with any comment on it; returns
// the row as stored
export async function saveRequest(
  values: SomiFormValues,
  saved?: SomiRequest,
  comment?: SomiComment,
): Promise<SomiRequest> {
  const row = toRow(values)

  if (!saved) return unwrap(await table().insert(row).select().single<SomiRequest>())

  // Send only what changed, so saving a form left open doesn't undo a newer save from another stage
  const savedRow = toRow(toValues(saved))
  const changes = Object.fromEntries(
    Object.entries(row).filter(
      ([column, value]) =>
        value !== undefined && comparable(value) !== comparable(savedRow[column]),
    ),
  )
  if (comment) return appendComment(saved.id, comment, changes)
  if (!Object.keys(changes).length) return saved

  // .single() fails an update that matched no rows, which would otherwise look like a success
  return unwrap(await table().update(changes).eq('id', saved.id).select().single<SomiRequest>())
}
