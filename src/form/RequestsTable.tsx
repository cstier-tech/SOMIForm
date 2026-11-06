import { Button, Table } from 'oa'
import { recordHref } from './recordLink'
import type { SomiRequest } from './somiRequest'
import { StatusBadge } from './StatusBadge'

const columns: {
  label: string
  column: Exclude<keyof SomiRequest, 'comments' | 'approval_status'>
}[] = [
  { label: 'Date', column: 'date' },
  { label: 'Customer Name', column: 'customer_name' },
  { label: 'Customer Number', column: 'customer_number' },
  { label: 'Item Name', column: 'item_name' },
  { label: 'Process', column: 'process_to_produce' },
  { label: 'Estimator', column: 'estimator' },
  { label: 'PSI Number', column: 'psi_no' },
  { label: 'Veracore Number', column: 'veracore_no' },
]

export function RequestsTable({ requests }: { requests: SomiRequest[] }) {
  if (!requests.length) {
    return <p className="text-muted">No records yet.</p>
  }

  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          {columns.map(({ label }) => (
            <th key={label}>{label}</th>
          ))}
          <th>Status</th>
          <th aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr key={request.id}>
            {columns.map(({ column }) => (
              <td key={column}>{request[column]}</td>
            ))}
            <td>
              <StatusBadge status={request.approval_status} />
            </td>
            <td>
              <Button size="sm" href={recordHref(request.id)}>
                View
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
