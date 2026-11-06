import { useFormContext, type Path } from 'react-hook-form'
import { FormControl, FormGroup, FormLabel, Table } from 'oa'
import { estimatedMonths } from './quantityEstimated'
import type { SomiFormValues } from './types'

// Laid out like ApprovedMonthsTable, with inputs in place of its values
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
              <td className="align-middle">{months}</td>
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
}

function NumberCell({ name, label }: NumberCellProps) {
  const { register } = useFormContext<SomiFormValues>()

  return (
    <FormControl
      type="number"
      size="sm"
      min={0}
      // Allows decimals
      step="any"
      aria-label={label}
      {...register(name, { valueAsNumber: true })}
    />
  )
}
