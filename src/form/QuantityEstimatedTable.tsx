import { useFormContext, type Path } from 'react-hook-form'
import { FormControl, FormGroup, FormLabel, Table } from 'oa'
import { estimatedMonths } from './quantityEstimated'
import type { SomiFormValues } from './types'

export function QuantityEstimatedTable() {
  return (
    <FormGroup>
      <FormLabel>Quantity Estimated</FormLabel>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>Months</th>
            <th>Quantity</th>
            <th>Manufacturing Cost</th>
          </tr>
        </thead>
        <tbody>
          {estimatedMonths.map((months, index) => (
            <tr key={months}>
              <td>{months}</td>
              <td>
                <NumberCell
                  name={`quantityEstimated.${index}.quantity`}
                  label={`Quantity for ${months} month(s)`}
                />
              </td>
              <td>
                <NumberCell
                  name={`quantityEstimated.${index}.manufacturingCost`}
                  label={`Manufacturing cost for ${months} month(s)`}
                  step="0.01"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </FormGroup>
  )
}

type NumberCellProps = {
  name: Path<SomiFormValues>
  label: string
  step?: string
}

function NumberCell({ name, label, step }: NumberCellProps) {
  const { register } = useFormContext<SomiFormValues>()

  return (
    <FormControl
      type="number"
      min={0}
      step={step}
      aria-label={label}
      {...register(name, { valueAsNumber: true })}
    />
  )
}
