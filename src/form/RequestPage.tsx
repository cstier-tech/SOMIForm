import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Alert,
  Button,
  Card,
  CardBody,
  FormGroup,
  FormLabel,
  FormSelect,
} from 'oa'
import { DecisionOffcanvas } from './DecisionOffcanvas'
import { DocumentsList } from './DocumentsList'
import { PageContent } from './PageContent'
import { ProgressTracker } from './ProgressTracker'
import { listHref, newRecord, recordHref } from './recordLink'
import { BackToStepModal } from './BackToStepModal'
import { RecordDetails, RecordSummary } from './RecordDetails'
import { SomiForm } from './SomiForm'
import {
  appendComment,
  fetchRequest,
  saveRequest,
  setStatus,
  toValues,
  type ChangeLogEntry,
  type Decision,
  type SomiRequest,
} from './somiRequest'
import { resubmitLabels, stageLabels, stages, submitLabels, type Stage } from './stages'
import {
  approvedStatus,
  canceledStatus,
  deniedStatus,
  nextStage,
  progressStatuses,
  type Status,
} from './status'
import { StatusBadge } from './StatusBadge'
import type { SomiFormValues } from './types'
import { useChangeLog } from './useChangeLog'

type RequestPageProps = {
  // The id of the record to view, or newRecord
  record: string
}

export function RequestPage({ record }: RequestPageProps) {
  const isNew = record === newRecord
  const [request, setRequest] = useState<SomiRequest>()
  const [loadError, setLoadError] = useState<string>()

  useEffect(() => {
    if (isNew) return
    fetchRequest(record)
      .then(setRequest)
      .catch((error: Error) => setLoadError(error.message))
  }, [record, isNew])

  if (isNew || request) return <RequestEditor request={request} />

  return (
    <RecordContent>
      {loadError ? (
        <Alert variant="danger">Could not load record: {loadError}</Alert>
      ) : (
        <p className="text-muted">Loading…</p>
      )}
    </RecordContent>
  )
}

type RecordContentProps = {
  children?: ReactNode
  // Full width under the back link, above children and the sidebar
  header?: ReactNode
  // To the right of children, below the header
  sidebar?: ReactNode
}

function RecordContent({ children, header, sidebar }: RecordContentProps) {
  return (
    <PageContent
      header={
        <>
          <a className="d-inline-block mb-3" href={listHref}>
            Back to records
          </a>
          {header}
        </>
      }
      sidebar={sidebar}
    >
      {children}
    </PageContent>
  )
}

// Whether the stage has already approved or submitted the record: it's at or past the stage's
// status now, or, if it's been denied or canceled, the last status it had before was. Only the last
// one counts, since it can have been sent back to an earlier step since.
function hasSubmitted(stage: Stage, request: SomiRequest, changeLog: ChangeLogEntry[]) {
  const isProgress = (value: string | null) => progressStatuses.includes(value as Status)
  const last = isProgress(request.approval_status)
    ? request.approval_status
    : changeLog.find((entry) => entry.field_name === 'approval_status' && isProgress(entry.new_value))
      ?.new_value
  return progressStatuses.indexOf(last as Status) >= progressStatuses.indexOf(approvedStatus[stage])
}

// Whether the stage has denied the record. Denying requires a comment, so there's always one.
function hasDenied(stage: Stage, request: SomiRequest) {
  return (request.comments ?? []).some((c) => c.stage === stage && c.decision === 'deny')
}

type RequestEditorProps = {
  // The record to edit; a new one when left out
  request?: SomiRequest
}

function RequestEditor({ request }: RequestEditorProps) {
  // TODO: derive from the record's status / signed-in user instead of a picker
  const [stage, setStage] = useState<Stage>('sales')
  const methods = useForm<SomiFormValues>({ defaultValues: request && toValues(request) })
  const [saved, setSaved] = useState(request)
  const [decision, setDecision] = useState<Decision>('approve')
  const [formOpen, setFormOpen] = useState(false)
  const [saveError, setSaveError] = useState<string>()
  const [backToStep, setBackToStep] = useState<Status>()
  const changeLog = useChangeLog(saved)
  // The label for the stage's one button, if it submits instead of approving. Undefined once a
  // stage without a resubmit label has submitted, since there's nothing left for it to do.
  const submitLabel =
    saved && hasSubmitted(stage, saved, changeLog.entries)
      ? resubmitLabels[stage]
      : submitLabels[stage]

  const openForm = (choice: Decision) => {
    setDecision(choice)
    setSaveError(undefined)
    setFormOpen(true)
  }

  // Only approve and submit save the stage's fields; the others save just their comment and status
  const submitDecision = (record: SomiRequest, data: SomiFormValues, decision: Decision) => {
    const comment = data.comment.trim()
    switch (decision) {
      case 'approve':
      case 'submit':
        return saveRequest(
          data,
          approvedStatus[stage],
          stage,
          record,
          comment ? { comment, stage, decision } : undefined,
        )
      case 'deny':
        return appendComment(record.id, { comment, stage, decision }, { approval_status: deniedStatus })
      case 'cancel':
        return comment
          ? appendComment(
            record.id,
            { comment, stage, decision },
            { approval_status: canceledStatus },
          )
          : setStatus(record.id, canceledStatus, stage)
    }
  }

  // Moves on to the stage whose step is next, so it's ready to act. Stays put once there's no next
  // step, such as when the record was denied or canceled.
  const showNextStage = (result: SomiRequest) => {
    const next = nextStage(result.approval_status)
    if (next) setStage(next)
  }

  const save = async (write: () => Promise<SomiRequest>) => {
    setSaveError(undefined)
    try {
      const result = await write()
      // A new record now has its own link, so a refresh reopens it instead of a blank form
      if (!saved) window.history.replaceState(null, '', recordHref(result.id))
      setSaved(result)
      methods.setValue('comment', '')
      // It's been uploaded, so a later save from another stage mustn't upload it again
      methods.resetField('estimateFile')
      showNextStage(result)
      setFormOpen(false)
    } catch (error) {
      setSaveError(`Could not save: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const createRecord = (data: SomiFormValues) =>
    save(() => saveRequest(data, approvedStatus.sales, 'sales'))

  const decide = async (data: SomiFormValues, decision: Decision) => {
    if (saved) await save(() => submitDecision(saved, data, decision))
  }

  // The buttons on a saved record for the chosen stage, which open its form. None once there's
  // nothing left for the stage to do. Comments are only left with one of these decisions.
  const stageActions = (record: SomiRequest) => {
    // A denied record is finished with, so no stage can approve, submit or cancel it
    if (record.approval_status === deniedStatus) return null
    // Sales only submits the request, so it cancels it instead of approving
    if (stage === 'sales') {
      return (
        <Button
          variant="danger"
          disabled={record.approval_status === canceledStatus}
          onClick={() => openForm('cancel')}
        >
          Cancel
        </Button>
      )
    }
    // These stages only fill in their fields, so there's nothing to deny
    if (submitLabels[stage]) {
      return (
        submitLabel && (
          <Button variant="success" onClick={() => openForm('submit')}>
            {submitLabel}
          </Button>
        )
      )
    }
    // An approving stage that has already approved or denied the record
    if (hasSubmitted(stage, record, changeLog.entries) || hasDenied(stage, record)) return null
    return (
      <>
        <Button variant="danger" onClick={() => openForm('deny')}>
          Deny
        </Button>
        <Button variant="success" onClick={() => openForm('approve')}>
          Approve
        </Button>
      </>
    )
  }

  // A new record has nothing to view yet, so it's just the form until it's saved
  if (!saved) {
    return (

      <RecordContent>
        <div className='mx-6'>
          <h1 className="mb-3">New Record</h1>
          {saveError && <Alert variant="danger">{saveError}</Alert>}
          <FormProvider {...methods}>
            <Card className='card-shadow'>
              <CardBody>
                <SomiForm stage={stage} onSubmit={createRecord} />
              </CardBody>
            </Card>
          </FormProvider></div>
      </RecordContent>


    )
  }

  return (
    <>
      <RecordContent
        header={
          <>
            <div className="d-flex align-items-center gap-3 mb-3">
              <h1 className="mb-0">Record Details</h1>
              <StatusBadge status={saved.approval_status} />
            </div>
            <FormGroup controlId="stage">
              <FormLabel>Stage</FormLabel>
              <FormSelect
                value={stage}
                onChange={(e) => {
                  setStage(e.target.value as Stage)
                  setSaveError(undefined)
                  setFormOpen(false)
                }}
              >
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {stageLabels[s]}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
            <RecordSummary request={saved} actions={stageActions(saved)} />
          </>
        }
        sidebar={
          <>
            <ProgressTracker
              request={saved}
              changeLog={changeLog}
              onBackToStep={setBackToStep}
            />
            <DocumentsList request={saved} />
          </>
        }
      >
        <RecordDetails request={saved} />
      </RecordContent>
      <FormProvider {...methods}>
        <DecisionOffcanvas
          show={formOpen}
          stage={stage}
          decision={decision}
          submitLabel={submitLabel}
          error={saveError}
          onClose={() => setFormOpen(false)}
          onSubmit={decide}
        />
      </FormProvider>
      <BackToStepModal
        request={saved}
        step={backToStep}
        stage={stage}
        onClose={() => setBackToStep(undefined)}
        onSentBack={(result) => {
          setSaved(result)
          // The form still holds what was cleared, which would fill the redone steps' forms
          methods.reset(toValues(result))
          setBackToStep(undefined)
          setFormOpen(false)
          showNextStage(result)
        }}
      />
    </>
  )
}
