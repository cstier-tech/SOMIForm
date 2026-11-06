import { useFormContext, type Path } from 'react-hook-form'
import { Col, FormControl, FormGroup, Row } from 'oa'
import { estimatedMonths } from './quantityEstimated'
import type { SomiFormValues } from './types'

// Months, Estimated Quantity and Estimated Manufacturing Cost, as grid columns at every width
const columns = [
  { label: 'Months', xs: 1 },
  // Split what's left evenly
  { label: 'Estimated Quantity', xs: true },
  { label: 'Estimated Manufacturing Cost', xs: true },
]

export function QuantityEstimatedTable() {
  return (
    <FormGroup>
      <div role="table" aria-label="Quantity Estimated">
        <Row role="row" className="m-0">
          {columns.map(({ label, xs }) => (
            <Col key={label} role="columnheader" xs={xs} className="h5 mb-0 p-2">
              {label}
            </Col>
          ))}
        </Row>
        {estimatedMonths.map((months, index) => (
          <Row key={months} role="row" className="m-0">
            <Col
              role="cell"
              xs={columns[0].xs}
              className="d-flex align-items-center h5 mb-0 p-2"
            >
              {months}
            </Col>
            <Col role="cell" xs={columns[1].xs} className="p-2">
              <NumberCell
                name={`quantityEstimated.${index}.quantity`}
                label={`Quantity for ${months} month(s)`}
              />
            </Col>
            <Col role="cell" xs={columns[1].xs} className="p-2">
              <NumberCell
                name={`quantityEstimated.${index}.manufacturingCost`}
                label={`Manufacturing cost for ${months} month(s)`}
              />
            </Col>
          </Row>
        ))}
      </div>
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
      min={0}
      // Allows decimals
      step="any"
      aria-label={label}
      {...register(name, { valueAsNumber: true })}
    />
  )
}
