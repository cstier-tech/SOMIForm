import { Badge } from 'oa'
import { statusVariant, type Status } from './status'

// Nothing for records saved before statuses were recorded
export function StatusBadge({ status }: { status: Status | null }) {
  return status && <Badge variant={statusVariant(status)}>{status}</Badge>
}
