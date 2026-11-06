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
import type { FormDecision } from './DecisionForm'
import { DecisionOffcanvas } from './DecisionOffcanvas'
import { PageContent } from './PageContent'
import { listHref, newRecord, recordHref } from './recordLink'
import { RecordDetails } from './RecordDetails'
import { SomiForm } from './SomiForm'
import {
  appendComment,
  fetchRequest,
  saveRequest,
  setStatus,
  toValues,
  type ChangeLogEntry,
  type SomiRequest,
} from './somiRequest'
import { resubmitLabels, stageLabels, stages, submitLabels, type Stage } from './stages'
import {
  approvedStatus,
  canceledStatus,
  deniedStatus,
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

function RecordContent({ children }: { children: ReactNode }) {
  return (
    <PageContent>
      <a className="d-inline-block mb-3" href={listHref}>
        Back to records
      </a>
      {children}
    </PageContent>
  )
}

// Whether the stage has already approved or submitted the record: it's at or past the stage's
// status now, or the change log shows it got there before being denied or canceled
function hasSubmitted(stage: Stage, request: SomiRequest, changeLog: ChangeLogEntry[]) {
  const status = approvedStatus[stage]
  const current = progressStatuses.indexOf(request.approval_status as Status)
  return (
    current >= progressStatuses.indexOf(status) ||
    changeLog.some((entry) => entry.field_name === 'approval_status' && entry.new_value === status)
  )
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
  const [decision, setDecision] = useState<FormDecision>('approve')
  const [formOpen, setFormOpen] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [saveError, setSaveError] = useState<string>()
  const changeLog = useChangeLog(saved)
  // The label for the stage's one button, if it submits instead of approving
  const submitLabel =
    (saved && hasSubmitted(stage, saved, changeLog.entries) && resubmitLabels[stage]) ||
    submitLabels[stage]

  const openForm = (choice: FormDecision) => {
    setDecision(choice)
    setJustSaved(false)
    setSaveError(undefined)
    setFormOpen(true)
  }

  // Only approve and submit save the stage's fields; the others save just their comment and status
  const submitDecision = (record: SomiRequest, data: SomiFormValues, decision: FormDecision) => {
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
      setJustSaved(true)
      setFormOpen(false)
    } catch (error) {
      setSaveError(`Could not save: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const createRecord = (data: SomiFormValues) =>
    save(() => saveRequest(data, approvedStatus.sales, 'sales'))

  const decide = async (data: SomiFormValues, decision: FormDecision) => {
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
    if (submitLabel) {
      return (
        <Button variant="success" onClick={() => openForm('submit')}>
          {submitLabel}
        </Button>
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
        <h1 className="mb-3">New Record</h1>
        {saveError && <Alert variant="danger">{saveError}</Alert>}
        <FormProvider {...methods}>
          <Card>
            <CardBody>
              <SomiForm stage={stage} onSubmit={createRecord} />
            </CardBody>
          </Card>
        </FormProvider>
      </RecordContent>
    )
  }

  return (
    <>
      <RecordContent>
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
              setJustSaved(false)
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
        {justSaved && <Alert variant="success">Saved.</Alert>}
        <RecordDetails
          request={saved}
          changeLog={changeLog}
          actions={stageActions(saved)}
        />
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
    </>
  )
}
