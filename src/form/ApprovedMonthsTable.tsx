import { useFormContext, useWatch } from 'react-hook-form'
import { FormCheck, FormGroup, FormLabel, Table } from 'oa'
import { displayCell, estimatedMonths, monthsLabel, type EstimateRow } from './quantityEstimated'
import type { SomiFormValues } from './types'

export function ApprovedMonthsTable() {
  const { register } = useFormContext<SomiFormValues>()
  const estimates = useWatch<SomiFormValues>({ name: 'quantityEstimated' }) as
    | EstimateRow[]
    | undefined
  const registration = register('approvedMonths')

  return (
    <FormGroup>
      <FormLabel>Approved Months of Inventory</FormLabel>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>Select</th>
            <th>Months</th>
            <th>Quantity</th>
            <th>Manufacturing Cost</th>
          </tr>
        </thead>
        <tbody>
          {estimatedMonths.map((months, index) => (
            <tr key={months}>
              <td>
                <FormCheck
                  type="radio"
                  id={`approvedMonths-${months}`}
                  aria-label={`Approve ${months} month(s)`}
                  value={monthsLabel(months)}
                  {...registration}
                />
              </td>
              <td>{months}</td>
              <td>{displayCell(estimates?.[index]?.quantity)}</td>
              <td>{displayCell(estimates?.[index]?.manufacturingCost)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </FormGroup>
  )
}
