import { Card, CardHeader } from 'oa'
import type { SomiRequest } from './somiRequest'
import type { Status } from './status'
import type { ChangeLog } from './useChangeLog'
import { WorkflowSteps } from './WorkflowSteps'

type ProgressTrackerProps = {
  // The record as stored
  request: SomiRequest
  // From useChangeLog
  changeLog: ChangeLog
  // Shows a back button on the done steps that can be undone; given the status the step moves the
  // record to
  onBackToStep?: (status: Status) => void
}

// The record's workflow steps in a card, for the page's sidebar
export function ProgressTracker({ request, changeLog, onBackToStep }: ProgressTrackerProps) {
  return (
    <Card className="mb-3">
      <CardHeader className="font-weight-600">Progress Tracker</CardHeader>
      <WorkflowSteps
        request={request}
        changeLog={changeLog.entries}
        onBackToStep={onBackToStep}
      />
    </Card>
  )
}
