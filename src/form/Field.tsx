import { useController, useFormContext, type RegisterOptions } from 'react-hook-form'
import { Feedback, FormCheck, FormControl, FormGroup, FormLabel } from 'oa'
import type { FieldDef } from './fields'
import type { SomiFormValues } from './types'

export function Field({ def }: { def: FieldDef }) {
  if (def.component) return <def.component />
  return def.kind === 'yesNo' ? <YesNoField def={def} /> : <InputField def={def} />
}

const yesNoOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]

// Radios register their value as a string, so these are controlled to keep the value a boolean
function YesNoField({ def }: { def: FieldDef }) {
  const { field } = useController<SomiFormValues>({ name: def.name, rules: def.rules })

  return (
    <FormGroup>
      <FormLabel className='d-block'>{def.label}</FormLabel>
        {yesNoOptions.map((option) => (
          <FormCheck
          className='form-check-inline'
            key={option.label}
            type="radio"
            id={`${def.name}-${option.label}`}
            name={field.name}
            label={option.label}
            checked={field.value === option.value}
            onChange={() => field.onChange(option.value)}
            onBlur={field.onBlur}
          />
        ))}
    </FormGroup>
  )
}

function InputField({ def }: { def: FieldDef }) {
  const { register, getFieldState, formState } = useFormContext<SomiFormValues>()
  const { error } = getFieldState(def.name, formState)
  const rules =
    def.kind === 'number'
      ? ({ ...def.rules, valueAsNumber: true } as RegisterOptions<SomiFormValues>)
      : def.rules
  const registration = register(def.name, rules)

  switch (def.kind) {
    case 'radio':
      return (
        <FormGroup>
          <FormLabel>{def.label}</FormLabel>
          {def.options?.map((option) => (
            <FormCheck
              key={option}
              type="radio"
              id={`${def.name}-${option}`}
              label={option}
              value={option}
              {...registration}
            />
          ))}
        </FormGroup>
      )
    default:
      return (
        <FormGroup controlId={def.name}>
          <FormLabel>{def.label}</FormLabel>
          <FormControl
            as={def.kind === 'textarea' ? 'textarea' : undefined}
            type={def.kind === 'textarea' ? undefined : def.kind}
            min={def.kind === 'number' ? 0 : undefined}
            // Allows decimals
            step={def.kind === 'number' ? 'any' : undefined}
            {...registration}
            isInvalid={!!error}
          />
          <Feedback type="invalid">{error?.message}</Feedback>
        </FormGroup>
      )
  }
}
