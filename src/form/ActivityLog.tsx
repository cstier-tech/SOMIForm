import { Alert, Table } from 'oa'
import { allFields } from './fields'
import { estimatedMonths, monthsLabel } from './quantityEstimated'
import { estimateColumn, fieldForColumn, type ChangeLogEntry } from './somiRequest'

// Left out: comments, because the Progress Tracker's steps already show them and each change is the
// whole list as JSON; and the SOMI cost worksheet's columns, because they're calculated from other
// columns, which are logged themselves
const hiddenColumns = [
  'comments',
  'mark_up',
  'unit_dm_cost',
  'storage_charge',
  'est_value_at_dm',
  'item_sell_price',
  'monthly_cost_to_carry',
  'monthly_storage_per_unit',
  'monthly_unit_cost_to_carry',
]

type ActivityLogProps = {
  // From useChangeLog, newest first
  entries: ChangeLogEntry[]
  error?: string
}

// Every logged change to the record, newest first. Nothing until there's at least one.
export function ActivityLog({ entries, error }: ActivityLogProps) {
  if (error) return <Alert variant="danger">Could not load the activity log: {error}</Alert>

  const shown = entries.filter((entry) => !hiddenColumns.includes(entry.field_name))
  if (!shown.length) return null

  return (
    <div className="mt-3">
      <h4>Activity Log</h4>
      <Table className="border" bordered>
        <thead>
          <tr className="bg-gray-100">
            <th>Field Name</th>
            <th>Old Value</th>
            <th>New Value</th>
            <th>Changed By</th>
            <th>Changed At</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((entry) => (
            <tr key={entry.id}>
              <td>{columnLabel(entry.field_name)}</td>
              <td style={{ whiteSpace: 'pre-line' }}>
                {displayValue(entry.field_name, entry.old_value)}
              </td>
              <td style={{ whiteSpace: 'pre-line' }}>
                {displayValue(entry.field_name, entry.new_value)}
              </td>
              <td>{entry.changed_by ?? '—'}</td>
              <td>{new Date(entry.changed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

function fieldDef(column: string) {
  const field = fieldForColumn(column)
  return field && allFields().find((def) => def.name === field)
}

// Columns that aren't a form field of their own
const columnLabels: Record<string, string> = {
  approval_status: 'Status',
  approved_qty_estimated: 'Approved Quantity',
  approved_manufacturing_cost: 'Approved Manufacturing Cost',
}

// The label the form uses for the column, falling back to the column's own name
function columnLabel(column: string) {
  if (column in columnLabels) return columnLabels[column]

  const def = fieldDef(column)
  if (def) return def.shortLabel ?? def.label

  const estimate = estimateColumn(column)
  if (estimate) {
    const months = monthsLabel(estimatedMonths[estimate.index])
    return `${estimate.isQuantity ? 'Quantity' : 'Manufacturing Cost'} (${months})`
  }

  return column
}

// The log stores every value as text, so yes/no answers arrive as 'true' or 'false'
function displayValue(column: string, value: string | null) {
  // return empty string if no value
  if (value === null || value === '') return ''
  if (value !== 'true' && value !== 'false') return value

  const answer = value === 'true'
  const def = fieldDef(column)
  if (def?.formatValue) return def.formatValue(answer)
  return answer ? 'Yes' : 'No'
}
