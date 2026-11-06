import { ListGroup, ListGroupItem } from 'oa'
import type { ChangeLogEntry, Decision, SomiRequest } from './somiRequest'
import { stageLabels, type Stage } from './stages'
import {
  progressStatuses,
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

// How a comment's decision reads when it's listed on its own, below the steps
const decisionLabels: Record<Decision, { label: string; className: string }> = {
  approve: { label: 'Approved', className: 'text-success' },
  submit: { label: 'Submitted', className: 'text-success' },
  deny: { label: 'Denied', className: 'text-danger' },
  comment: { label: 'Comment', className: 'text-muted' },
  cancel: { label: 'Canceled', className: 'text-danger' },
}

function isProgressStatus(value: string | null): value is Status {
  return progressStatuses.includes(value as Status)
}

// The latest time the record moved to the given status
function latestChangeTo(changeLog: ChangeLogEntry[], status: string) {
  return changeLog.find((entry) => entry.field_name === statusColumn && entry.new_value === status)
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

function isApproval(comment: SomiComment, stage: Stage) {
  return comment.stage === stage && (comment.decision === 'approve' || comment.decision === 'submit')
}

// The record's progress through the workflow, with its comments. Done steps say who did them and
// when, along with any comment left when approving or submitting; the next one is active, and the
// rest are disabled. A denied or canceled record shows who stopped it, when, and why on the step it
// stopped at instead, and a denied one leaves out the steps after it. Every other comment is listed
// below the steps, oldest first.
export function WorkflowSteps({ request, changeLog }: WorkflowStepsProps) {
  const reached = reachedIndex(request, changeLog)
  const stop = Object.values(stopped).find((s) => s.status === request.approval_status)
  const stopChange = stop && latestChangeTo(changeLog, stop.status)
  const stopText =
    stop &&
    (stopChange
      ? stop.text(signoff(stopChange.changed_by, stopChange.changed_at, 'unknown'))
      : stop.status)
  const next = steps.find((s) => s.index > reached)

  const comments = request.comments ?? []
  const doneStages = new Set(steps.filter((s) => s.index <= reached).map((s) => s.stage))
  // The comment given with the denial or cancellation that stopped the record
  const stopComment =
    stop && comments.findLast((c) => c.decision === stopDecisions[stop.status])
  // Those not shown on a step
  const otherComments = comments.filter(
    (c) =>
      c !== stopComment &&
      !(doneStages.has(c.stage) && (c.decision === 'approve' || c.decision === 'submit')),
  )

  return (
    <ListGroup variant='flush' className='has-icons'>
      {steps.map(({ stage, status, step, index }) => {
        if (index <= reached) {
          const change = latestChangeTo(changeLog, status)
          // A new record's status may not be logged, so the first step falls back to when it was
          // created
          const done =
            change ?? (index === 0 ? { changed_by: null, changed_at: request.created_at } : null)
          // Who completed it and when; nothing until the change log has loaded
          const text =
            done &&
            step.completedText(signoff(done.changed_by, done.changed_at, stageLabels[stage]))
          return (
            <ListGroupItem key={status}>
              <i className="fas fa-check-circle list-group-item-icon text-success" aria-label="Done" />
              <div className="flex-grow-1">
                <h6 className="mb-1">{step.label}</h6>
                {text && <small className="text-muted">{text}</small>}
                {comments
                  .filter((c) => isApproval(c, stage))
                  .map((c, i) => (
                    <StepComment key={i} comment={c} />
                  ))}
              </div>
            </ListGroupItem>
          )
        }

        if (index === next?.index) {
          return (
            <ListGroupItem key={status} active={!stop} variant={stop && 'danger'}>
              <i className="fas fa-dot-circle list-group-item-icon"></i>
              <div className="flex-grow-1">
                <h6 className="mb-1">{step.label}</h6>
                {stopText && <small>{stopText}</small>}
                {stopComment && <StepComment comment={stopComment} />}
              </div>

            </ListGroupItem>
          )
        }

        // Nothing more happens to a denied record, so the steps after the one it stopped at are left out
        if (stop === stopped.denied) return null

        return (
          <ListGroupItem key={status} disabled>
            <i className="far fa-circle list-group-item-icon"></i>
            <div>
              <h6>{step.label}</h6>
            </div>

          </ListGroupItem>
        )
      })}
      {/* Stopped after every step was done, so there's no step to show it on */}
      {stop && !next && (
        <ListGroupItem variant="danger">
          <i className="far fa-circle list-group-item-icon"></i>
          <div className="flex-grow-1">
            <h6>{stop.status}</h6>
            {stopText && <small>{stopText}</small>}
            {stopComment && <StepComment comment={stopComment} />}
          </div>

        </ListGroupItem>
      )}
      {otherComments.map(({ comment, stage, decision, createdAt }, index) => (
        <ListGroupItem key={`comment-${index}`}>
          <i className="far fa-comment list-group-item-icon text-muted" aria-label="Comment" />
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between gap-2">
              <h6 className="mb-1">{stageLabels[stage]}</h6>
              <small className={decisionLabels[decision].className}>
                {decisionLabels[decision].label}
              </small>
            </div>
            {createdAt && (
              <small className="text-muted">{new Date(createdAt).toLocaleString()}</small>
            )}
            <CommentText text={comment} />
          </div>
        </ListGroupItem>
      ))}
    </ListGroup>
  )
}

// A comment left with a step's approval, submission, denial or cancellation
function StepComment({ comment }: { comment: SomiComment }) {
  return <CommentText text={comment.comment} className="mt-1" />
}

// A comment's text, labeled. Line breaks are kept as written.
function CommentText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className} style={{ whiteSpace: 'pre-line' }}>
      <span className="font-weight-600">Comments:</span> {text}
    </div>
  )
}
