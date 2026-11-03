import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Alert, Button, Card, CardBody, FormGroup, FormLabel, FormSelect } from 'oa'
import { DecisionOffcanvas } from './DecisionOffcanvas'
import { PageContent } from './PageContent'
import { listHref, newRecord, recordHref } from './recordLink'
import { RecordDetails } from './RecordDetails'
import { SomiForm } from './SomiForm'
import {
  appendComment,
  fetchRequest,
  saveRequest,
  toValues,
  type Decision,
  type SomiRequest,
} from './somiRequest'
import { stageLabels, stages, type Stage } from './stages'
import type { SomiFormValues } from './types'

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
  const [justSaved, setJustSaved] = useState(false)
  const [saveError, setSaveError] = useState<string>()

  const openForm = (choice: Decision) => {
    setDecision(choice)
    setJustSaved(false)
    setSaveError(undefined)
    setFormOpen(true)
  }

  const submitDecision = (data: SomiFormValues, record: SomiRequest) => {
    // A denial saves only its comment, not anything left in the approval form
    if (decision === 'deny') {
      return appendComment(record.id, { comment: data.denyComment.trim(), stage, decision })
    }
    const comment = data.approveComment.trim()
    return saveRequest(data, record, comment ? { comment, stage, decision } : undefined)
  }

  const onSubmit = async (data: SomiFormValues) => {
    setSaveError(undefined)
    try {
      const result = await (saved ? submitDecision(data, saved) : saveRequest(data))
      // A new record now has its own link, so a refresh reopens it instead of a blank form
      if (!saved) window.history.replaceState(null, '', recordHref(result.id))
      setSaved(result)
      methods.setValue('approveComment', '')
      methods.setValue('denyComment', '')
      setJustSaved(true)
      setFormOpen(false)
    } catch (error) {
      setSaveError(`Could not save: ${error instanceof Error ? error.message : String(error)}`)
    }
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
              <SomiForm stage={stage} onSubmit={onSubmit} />
            </CardBody>
          </Card>
        </FormProvider>
      </RecordContent>
    )
  }

  return (
    <>
      <RecordContent>
        <h1 className="mb-3">Record Details</h1>
        <FormGroup controlId="stage">
          <FormLabel>Stage</FormLabel>
          <FormSelect
            value={stage}
            onChange={(e) => {
              setStage(e.target.value as Stage)
              setJustSaved(false)
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
        <RecordDetails request={saved} />
        <div className="d-flex justify-content-end gap-2">
          <Button variant="danger" onClick={() => openForm('deny')}>
            Deny
          </Button>
          <Button variant="success" onClick={() => openForm('approve')}>
            Approve
          </Button>
        </div>
      </RecordContent>
      <FormProvider {...methods}>
        <DecisionOffcanvas
          show={formOpen}
          stage={stage}
          decision={decision}
          error={saveError}
          onClose={() => setFormOpen(false)}
          onSubmit={onSubmit}
        />
      </FormProvider>
    </>
  )
}
