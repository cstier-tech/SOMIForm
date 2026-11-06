import { Fragment } from 'react'
import { Button, ListGroup, ListGroupItem, Tooltip } from 'oa'
import './WorkflowSteps.css'
import { isSentBack, sentBackBy, type ChangeLogEntry, type Decision, type SomiRequest } from './somiRequest'
import { stageLabels, type Stage } from './stages'
import {
  progressStatuses,
  revertedText,
  stopped,
  workflow,
  type Signoff,
  type Status,
  type WorkflowEntry,
} from './status'

type WorkflowStepsProps = {
  request: SomiRequest
  // From useChangeLog, newest first. Until it loads, steps show as done without saying who did them.
  changeLog: ChangeLogEntry[]
  // Shows a back button on the done steps that can be undone; given the status the step moves the
  // record to
  onBackToStep?: (status: Status) => void
}

type SomiComment = NonNullable<SomiRequest['comments']>[number]

const statusColumn = 'approval_status'

// The steps in status.ts's workflow, with each one's position in it
const steps = (workflow as readonly WorkflowEntry[]).flatMap((entry, index) =>
  entry.step ? [{ ...entry, step: entry.step, index }] : [],
)

// The decision whose comment explains each stopped status
const stopDecisions: Record<string, Decision> = {
  [stopped.denied.status]: 'deny',
  [stopped.canceled.status]: 'cancel',
}

// How a comment is labeled on its stage's step. A denial or cancellation that still stops the
// record is shown with who stopped it, so it's just Comments; these are for earlier ones.
const commentLabels: Record<Decision, string> = {
  approve: 'Comments',
  submit: 'Comments',
  deny: 'Denial comments',
  cancel: 'Cancellation comments',
}

function isProgressStatus(value: string | null): value is Status {
  return progressStatuses.includes(value as Status)
}

function isChangeTo(entry: ChangeLogEntry, status: string) {
  return entry.field_name === statusColumn && entry.new_value === status
}

// The latest time the record moved to the given status
function latestChangeTo(changeLog: ChangeLogEntry[], status: string) {
  return changeLog.find((entry) => isChangeTo(entry, status))
}

function signoff(by: string | null, at: string, fallbackBy: string): Signoff {
  return { by: by || fallbackBy, at: new Date(at).toLocaleString() }
}

// Where in the workflow the record is: the index of the last workflow status it reached
function reachedIndex(request: SomiRequest, changeLog: ChangeLogEntry[]) {
  if (isProgressStatus(request.approval_status)) {
    return progressStatuses.indexOf(request.approval_status)
  }
  // Denied, canceled, or saved before statuses were recorded: the last workflow status it had.
  // Every saved record has been submitted, so it's at least that far.
  const last = changeLog.find(
    (entry) => entry.field_name === statusColumn && isProgressStatus(entry.new_value),
  )
  return last ? progressStatuses.indexOf(last.new_value as Status) : 0
}

// The record's progress through the workflow, with its comments. Each step lists its history: who
// did it and when, each time, and each time the record was sent back to it. The next one is active,
// and the rest are disabled. A canceled record gets a Request Canceled item after the last step done,
// saying who canceled it, when and why. A denied one shows that on the step it stopped at instead,
// in red, and leaves out the steps after it. Comments only ever show inside a step: each on its stage's step, oldest first. Done steps
// after the first can be gone back to, undoing them and the steps after, unless it's been denied.
export function WorkflowSteps({ request, changeLog, onBackToStep }: WorkflowStepsProps) {
  const reached = reachedIndex(request, changeLog)
  const stop = Object.values(stopped).find((s) => s.status === request.approval_status)
  const stopChange = stop && latestChangeTo(changeLog, stop.status)
  const stopText =
    stop &&
    (stopChange
      ? stop.text(signoff(stopChange.changed_by, stopChange.changed_at, 'unknown'))
      : stop.status)
  const next = steps.find((s) => s.index > reached)
  const canceled = stop === stopped.canceled
  // The step's history, oldest first: each time it was done, and each time the record was sent
  // back to it. Sending it back moves it to the status before the step, so that's how those are
  // found. Empty until the change log has loaded.
  const historyFor = ({ stage, status, step, index }: (typeof steps)[number]) => {
    const events: HistoryLine[] = changeLog
      .filter(
        (entry) =>
          entry.field_name === statusColumn &&
          (isSentBack(entry)
            ? progressStatuses.indexOf(entry.new_value as Status) === index - 1
            : entry.new_value === status),
      )
      .reverse()
      .map((entry) =>
        isSentBack(entry)
          ? {
              text: revertedText(
                entry.new_value ?? '',
                signoff(sentBackBy(entry), entry.changed_at, 'unknown'),
              ),
              reverted: true,
            }
          : { text: step.completedText(signoff(entry.changed_by, entry.changed_at, stageLabels[stage])) },
      )
    // A new record's status may not be logged, so the first step falls back to when it was created
    if (index === 0 && !events.length) {
      events.push({ text: step.completedText(signoff(null, request.created_at, stageLabels[stage])) })
    }
    return events
  }

  const comments = request.comments ?? []
  // The comment given with the denial or cancellation that stopped the record, shown with the stop
  // rather than on its stage's step
  const stopComment =
    stop && comments.findLast((c) => c.decision === stopDecisions[stop.status])
  // Entries with no text were left by resubmitting an estimate, which has since been removed
  const stageComments = (stage: Stage) =>
    comments
      .filter((c) => c.stage === stage && c !== stopComment && c.comment)
      .map((c, i) => <StepComment key={i} comment={c} />)

  return (
    <ListGroup variant='flush' className='has-icons'>
      {steps.map((entry) => {
        const { stage, status, step, index } = entry
        const history = historyFor(entry)
        if (index <= reached) {
          // The first step submits the request, so there's nothing before it to go back to
          const undoable = onBackToStep && index > 0 && stop !== stopped.denied
          return (
            <Fragment key={status}>
              <ListGroupItem className="align-items-start step-item">
                <i className="fas fa-check-circle list-group-item-icon text-success" aria-label="Done" />
                <div className="flex-grow-1">
                  <h6 className="mb-1">{step.label}</h6>
                  <StepHistory history={history} className="text-muted" />
                  {stageComments(stage)}
                </div>
                {undoable && (
                  <Tooltip title="Back to this step">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="btn-icon flex-shrink-0 ms-2 step-back-button"
                      onClick={() => onBackToStep(status as Status)}
                      aria-label={`Back to ${step.label}`}
                    >
                      <i className="fas fa-undo"></i>
                    </Button>
                  </Tooltip>
                )}
              </ListGroupItem>
              {canceled && index === reached && (
                <ListGroupItem variant="danger">
                  <i className="fas fa-times-circle list-group-item-icon" aria-label="Canceled" />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{stopped.canceled.label}</h6>
                    {stopText && <small className="d-block">{stopText}</small>}
                    {stopComment && <StepComment comment={stopComment} stop />}
                  </div>
                </ListGroupItem>
              )}
            </Fragment>
          )
        }

        // Nothing happens on a canceled record until it's sent back, so its next step is disabled
        // like the rest
        if (index === next?.index && !canceled) {
          // A cancellation has its own item above, so only a denial is shown here
          const denied = stop === stopped.denied
          return (
            <ListGroupItem key={status} active={!denied} variant={denied ? 'danger' : undefined}>
              <i className="fas fa-dot-circle list-group-item-icon"></i>
              <div className="flex-grow-1">
                <h6 className="mb-1">{step.label}</h6>
                <StepHistory
                  history={denied && stopText ? [...history, { text: stopText }] : history}
                />
                {stageComments(stage)}
                {denied && stopComment && <StepComment comment={stopComment} stop />}
              </div>

            </ListGroupItem>
          )
        }

        // Nothing more happens to a denied record, so the steps after the one it stopped at are left out
        if (stop === stopped.denied) return null

        return (
          <ListGroupItem key={status} disabled>
            <i className="far fa-circle list-group-item-icon"></i>
            <div className="flex-grow-1">
              <h6 className={history.length ? 'mb-1' : undefined}>{step.label}</h6>
              <StepHistory history={history} />
              {stageComments(stage)}
            </div>

          </ListGroupItem>
        )
      })}
      {/* Denied after every step was done, so there's no step to show it on */}
      {stop === stopped.denied && !next && (
        <ListGroupItem variant="danger">
          <i className="far fa-circle list-group-item-icon"></i>
          <div className="flex-grow-1">
            <h6>{stop.status}</h6>
            {stopText && <small>{stopText}</small>}
            {stopComment && <StepComment comment={stopComment} stop />}
          </div>

        </ListGroupItem>
      )}
    </ListGroup>
  )
}

// One line of a step's history; reverted for the record being sent back to the step
type HistoryLine = { text: string; reverted?: boolean }

// The lines of a step's history, one under the other. className styles the lines other than
// reverts, which are always red.
function StepHistory({ history, className }: { history: HistoryLine[]; className?: string }) {
  return history.map(({ text, reverted }, i) => (
    <small key={i} className={`d-block ${reverted ? 'text-danger' : (className ?? '')}`}>
      {text}
    </small>
  ))
}

type StepCommentProps = {
  comment: SomiComment
  // The denial or cancellation that stops the record, already labeled by the stop text above it
  stop?: boolean
}

// A comment's text, labeled by the decision it was left with. Line breaks are kept as written.
function StepComment({ comment, stop }: StepCommentProps) {
  // Comments saved before 'comment' was removed as a decision have no label of their own
  const label = stop ? 'Comments' : (commentLabels[comment.decision] ?? 'Comments')
  return (
    <div className="mt-1" style={{ whiteSpace: 'pre-line' }}>
      <span className="font-weight-600">{label}:</span> {comment.comment}
    </div>
  )
}
