import type { DefaultValues } from 'react-hook-form'
import { supabase } from '../supabase'
import { uploadEstimate } from './estimateFile'
import { hiddenFieldNames } from './fields'
import { approvedIndex } from './quantityEstimated'
import { stageLabels, type Stage } from './stages'
import type { Status } from './status'
import type { SomiFormValues } from './types'

// approve and deny are for the approving stages; comment and cancel are for Sales; submit is for
// the stages in submitLabels
export type Decision = 'approve' | 'deny' | 'comment' | 'cancel' | 'submit'

// One entry in the comments column
type SomiComment = {
  comment: string
  stage: Stage
  decision: Decision
  // When it was added, as an ISO string; comments added before this was recorded don't have one
  createdAt?: string
}

// A comment as the caller gives it; appendComment stamps the time
type NewComment = Omit<SomiComment, 'createdAt'>

// The columns this app reads and writes
export type SomiRequest = {
  id: string
  created_at: string
  date: string | null
  customer_name: string | null
  customer_number: string | null
  item_name: string | null
  consumption_per_mo: number | null
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
  manufacture_cost_1mo: number | null
  manufacture_cost_2mo: number | null
  manufacture_cost_3mo: number | null
  skids_to_inventory_item: number | null
  qty_est_mo_approved: string | null
  // The quantity and cost for the months approved, saved from the estimates columns
  approved_qty_estimated: number | null
  approved_manufacturing_cost: number | null
  tps_approved: boolean | null
  psi_no: string | null
  veracore_no: string | null
  // Null on records saved before statuses were recorded
  approval_status: Status | null
  comments: SomiComment[] | null
}

// The column each form field is saved to. estimateFile has no column, so it isn't saved. comments
// isn't here either: only appendComment writes it, so a save can't overwrite it.
// quantityEstimated is saved through estimateColumns below.
const fieldColumns = {
  // Sales
  date: 'date',
  customer: 'customer_name',
  customerNumber: 'customer_number',
  itemName: 'item_name',
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

// The columns for each row of quantityEstimated, in order
const estimateColumns = [
  { quantity: 'qty_estimated_1mo', manufacturingCost: 'manufacture_cost_1mo' },
  { quantity: 'qty_estimated_2mo', manufacturingCost: 'manufacture_cost_2mo' },
  { quantity: 'qty_estimated_3mo', manufacturingCost: 'manufacture_cost_3mo' },
] as const satisfies Record<keyof SomiFormValues['quantityEstimated'][number], keyof SomiRequest>[]

// The form field saved to a column, if any
export function fieldForColumn(column: string) {
  return (Object.keys(fieldColumns) as (keyof typeof fieldColumns)[]).find(
    (field) => fieldColumns[field] === column,
  )
}

// For one of the quantityEstimated columns, its row and whether it's the quantity or the cost
export function estimateColumn(column: string) {
  const index = estimateColumns.findIndex(
    (columns) => columns.quantity === column || columns.manufacturingCost === column,
  )
  if (index === -1) return undefined
  return { index, isQuantity: estimateColumns[index].quantity === column }
}

// Blank inputs arrive as '' or NaN, which date and numeric columns reject
function blankToNull(value: unknown) {
  return value === '' || Number.isNaN(value) ? null : value
}

function toRow(values: DefaultValues<SomiFormValues>) {
  const row: Record<string, unknown> = {}
  const hidden = hiddenFieldNames(values)
  for (const [field, column] of Object.entries(fieldColumns)) {
    // A hidden field is cleared, so an answer given before it was hidden isn't kept
    row[column] = hidden.has(field as keyof typeof fieldColumns)
      ? null
      : blankToNull(values[field as keyof typeof fieldColumns])
  }
  estimateColumns.forEach((columns, index) => {
    const estimate = values.quantityEstimated?.[index]
    row[columns.quantity] = blankToNull(estimate?.quantity)
    row[columns.manufacturingCost] = blankToNull(estimate?.manufacturingCost)
  })
  // Null rather than undefined when nothing's approved, so a save still sends it to clear the
  // columns
  const approved = values.quantityEstimated?.[approvedIndex(values.approvedMonths)]
  row.approved_qty_estimated = blankToNull(approved?.quantity ?? null)
  row.approved_manufacturing_cost = blankToNull(approved?.manufacturingCost ?? null)
  return row
}

export function toValues(request: SomiRequest) {
  // Empty columns become undefined, which is what the form uses for "not filled in"
  const values = Object.fromEntries(
    Object.entries(fieldColumns).map(([field, column]) => [field, request[column] ?? undefined]),
  )

  return {
    ...values,
    quantityEstimated: estimateColumns.map((columns) => ({
      quantity: request[columns.quantity] ?? undefined,
      manufacturingCost: request[columns.manufacturingCost] ?? undefined,
    })),
  } as DefaultValues<SomiFormValues>
}

function table() {
  return supabase.from('SOMIRequest')
}

// Sent with each write so the database knows which stage made it: the trigger that fills
// SOMIRequestChangeLog saves this as changed_by
const stageHeader = 'x-somi-stage'

function stageHeaderValue(stage: Stage) {
  return stageLabels[stage]
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

// One changed column, as logged by the trigger on SOMIRequest
export type ChangeLogEntry = {
  id: number
  field_name: string
  old_value: string | null
  new_value: string | null
  // The stage's label; empty for changes made outside the app
  changed_by: string | null
  changed_at: string
}

// The record's changes, newest first
export async function fetchChangeLog(id: string): Promise<ChangeLogEntry[]> {
  return unwrap(
    await supabase
      .from('SOMIRequestChangeLog')
      .select('id, field_name, old_value, new_value, changed_by, changed_at')
      .eq('somi_request_id', id)
      .order('changed_at', { ascending: false })
      // Columns changed in one save share a time, so this keeps them in a steady order
      .order('id', { ascending: false }),
  )
}

// An empty column reads back as undefined, which matches a field still left blank
function comparable(value: unknown) {
  return value === undefined ? null : value
}

// Adds to the end of the comments column, along with any other changes to the record, and
// returns the row as stored
export async function appendComment(
  id: string,
  newComment: NewComment,
  changes: object = {},
): Promise<SomiRequest> {
  const comment: SomiComment = { ...newComment, createdAt: new Date().toISOString() }
  for (let attempt = 0; attempt < 5; attempt++) {
    const { comments } = await fetchRequest(id)
    const update = table()
      .update({ ...changes, comments: [...(comments ?? []), comment] })
      .eq('id', id)
      .setHeader(stageHeader, stageHeaderValue(comment.stage))

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

// Moves a record to the given status without changing anything else; returns the row as stored
export async function setStatus(id: string, status: Status, stage: Stage): Promise<SomiRequest> {
  // .single() fails an update that matched no rows, which would otherwise look like a success
  return unwrap(
    await table()
      .update({ approval_status: status })
      .eq('id', id)
      .setHeader(stageHeader, stageHeaderValue(stage))
      .select()
      .single<SomiRequest>(),
  )
}

// Inserts a new request, or updates the one already saved along with any comment on it, and
// moves it to the given status; returns the row as stored. stage is the one making the change.
export async function saveRequest(
  values: SomiFormValues,
  status: Status,
  stage: Stage,
  saved?: SomiRequest,
  comment?: NewComment,
): Promise<SomiRequest> {
  const row = toRow(values)
  // Not a column: it's uploaded to storage under the record's id
  const estimate = values.estimateFile?.[0]

  if (!saved) {
    const inserted = unwrap(
      await table()
        .insert({ ...row, approval_status: status })
        .setHeader(stageHeader, stageHeaderValue(stage))
        .select()
        .single<SomiRequest>(),
    )
    if (estimate) await uploadEstimate(inserted.id, estimate)
    return inserted
  }

  // Before the record changes, so a failed upload leaves the record's status as it was
  if (estimate) await uploadEstimate(saved.id, estimate)

  // Send only what changed, so saving a form left open doesn't undo a newer save from another stage
  const savedRow = toRow(toValues(saved))
  const changes = Object.fromEntries(
    Object.entries(row).filter(
      ([column, value]) =>
        value !== undefined && comparable(value) !== comparable(savedRow[column]),
    ),
  )
  if (status !== saved.approval_status) changes.approval_status = status
  if (comment) return appendComment(saved.id, comment, changes)
  if (!Object.keys(changes).length) return saved

  // .single() fails an update that matched no rows, which would otherwise look like a success
  return unwrap(
    await table()
      .update(changes)
      .eq('id', saved.id)
      .setHeader(stageHeader, stageHeaderValue(stage))
      .select()
      .single<SomiRequest>(),
  )
}
