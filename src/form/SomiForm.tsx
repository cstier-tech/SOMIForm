import { useFormContext } from 'react-hook-form'
import { Button, Col, Form, Row } from 'oa'
import { Field } from './Field'
import { approveCommentField, denyCommentField, stageFields } from './fields'
import type { Decision } from './somiRequest'
import type { Stage } from './stages'
import type { SomiFormValues } from './types'

type SomiFormProps = {
  stage: Stage
  // What the user chose to do with the record; left out for a new one
  decision?: Decision
  onSubmit: (data: SomiFormValues) => Promise<void>
}

// Expects a FormProvider above it, which holds the values across stages
export function SomiForm({ stage, decision, onSubmit }: SomiFormProps) {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<SomiFormValues>()

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Row>
        {fieldsFor(stage, decision).map((def) => (
          <Col key={def.name} xs={12} md={def.cols ?? 12}>
            <Field def={def} />
          </Col>
        ))}
      </Row>
      <Button type="submit" disabled={isSubmitting}>
        Submit
      </Button>
    </Form>
  )
}

function fieldsFor(stage: Stage, decision?: Decision) {
  if (decision === 'deny') return [denyCommentField]
  return decision === 'approve'
    ? [...stageFields[stage], approveCommentField]
    : stageFields[stage]
}
