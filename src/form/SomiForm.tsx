import { useFormContext, useWatch } from 'react-hook-form'
import { Button, Col, Form, Row } from 'oa'
import { Field } from './Field'
import { hiddenFieldNames, stageFields, type FieldDef } from './fields'
import type { Stage } from './stages'
import type { SomiFormValues } from './types'

type SomiFormProps = {
  stage: Stage
  onSubmit: (data: SomiFormValues) => Promise<void>
}

// The form for a new record. Expects a FormProvider above it, which holds the values across stages.
export function SomiForm({ stage, onSubmit }: SomiFormProps) {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<SomiFormValues>()

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <FieldRows fields={stageFields[stage]} />
      <Button type="submit" disabled={isSubmitting}>
        Submit
      </Button>
    </Form>
  )
}

// The fields laid out on the grid, leaving out any hidden for the current values. Expects a
// FormProvider above it.
export function FieldRows({ fields }: { fields: FieldDef[] }) {
  const { control } = useFormContext<SomiFormValues>()
  const values = useWatch({ control })
  const hidden = hiddenFieldNames(values)

  return (
    <Row>
      {fields
        .filter((def) => !hidden.has(def.name))
        .map((def) => (
          <Col key={def.name} xs={12} md={def.cols ?? 12}>
            <Field def={def} />
          </Col>
        ))}
    </Row>
  )
}
