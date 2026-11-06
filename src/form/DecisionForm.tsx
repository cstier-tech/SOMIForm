import { useState, type FormEvent } from 'react'
import { useFormContext } from 'react-hook-form'
import { Alert, Button, Form } from 'oa'
import { decisionCommentField, stageFields } from './fields'
import { FieldRows } from './SomiForm'
import type { Decision } from './somiRequest'
import type { Stage } from './stages'
import type { SomiFormValues } from './types'

// Comments are only left with one of these, not on their own
export type FormDecision = Exclude<Decision, 'comment'>

type DecisionFormProps = {
  stage: Stage
  decision: FormDecision
  error?: string
  onSubmit: (data: SomiFormValues, decision: FormDecision) => Promise<void>
}

const commentRequired = 'Comments are required'

// The form for the stage's decision, shown in DecisionOffcanvas. Approving or submitting saves the
// stage's fields with an optional comment; denying and canceling save only the comment, which
// denying requires. Expects a FormProvider above it, which holds the values.
export function DecisionForm({ stage, decision, error, onSubmit }: DecisionFormProps) {
  const {
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = useFormContext<SomiFormValues>()
  const [denying, setDenying] = useState(false)
  const savesFields = decision === 'approve' || decision === 'submit'
  const fields = savesFields ? [...stageFields[stage], decisionCommentField] : [decisionCommentField]

  // Denying doesn't save the stage's fields, so they aren't validated, but it needs a comment
  const deny = async (event: FormEvent) => {
    event.preventDefault()
    clearErrors()
    if (!/\S/.test(getValues('comment') ?? '')) {
      setError('comment', { type: 'required', message: commentRequired }, { shouldFocus: true })
      return
    }
    setDenying(true)
    try {
      await onSubmit(getValues(), 'deny')
    } finally {
      setDenying(false)
    }
  }

  return (
    <Form
      noValidate
      onSubmit={decision === 'deny' ? deny : handleSubmit((data) => onSubmit(data, decision))}
    >
      {error && <Alert variant="danger">{error}</Alert>}
      <FieldRows fields={fields} />
      <Button type="submit" disabled={isSubmitting || denying}>
        Submit
      </Button>
    </Form>
  )
}
