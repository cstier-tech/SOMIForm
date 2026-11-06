import type { ReactNode } from 'react'
import { get, type DefaultValues } from 'react-hook-form'
import { Alert, Card, CardBody, Col, Row, Table } from 'oa'
import { hiddenFieldNames, stageFields, type FieldDef } from './fields'
import { approvedIndex, displayCell, estimatedMonths, monthsLabel } from './quantityEstimated'
import { somiCalculations } from './somiCalculations'
import { toValues, type SomiRequest } from './somiRequest'
import { stages } from './stages'
import type { SomiFormValues } from './types'

// Shown across the top in this order, so not listed in SOMI Details
const summaryFields: FieldDef['name'][] = ['itemName', 'customer', 'customerNumber', 'date']

// Shown in their own section, above the estimates table
const estimateDetailFields: FieldDef['name'][] = [
  'estimator',
  'estimatingSystem',
  'skidsRequired',
]

// Has its own table, beside SOMI Details
const estimateField: FieldDef['name'] = 'quantityEstimated'

// Not listed: the estimates table's Approved column already shows it
const approvedField: FieldDef['name'] = 'approvedMonths'

// Not listed: it's in storage rather than the record, and has a download button beside the Estimate Details heading
const estimateFileField: FieldDef['name'] = 'estimateFile'

// Not listed in SOMI Details. Reorder Points Established shows through the reorder point fields
// only appearing when it's Yes, and Confirm TSP through Sales 2's approval in the Progress Tracker sidebar.
const unlistedFields: FieldDef['name'][] = ['reorderPointsEstablished', 'salesApprovesTsp']

type Entry = { def: FieldDef; value: string }

// Every field across all stages that isn't hidden, with its value formatted
function recordEntries(values: DefaultValues<SomiFormValues>): Entry[] {
  const hidden = hiddenFieldNames(values)
  return stages
    .flatMap((stage) => stageFields[stage])
    .filter((def) => !hidden.has(def.name))
    .map((def) => ({ def, value: formatValue(def, get(values, def.name)) || '' }))//empty string for no value
}

type RecordSummaryProps = {
  // The record as stored
  request: SomiRequest
  // Shown at the end of the summary row, such as the Approve and Deny buttons
  actions?: ReactNode
}

// The record's key fields in a row, with the stage's action buttons at the end
export function RecordSummary({ request, actions }: RecordSummaryProps) {
  const summary = recordEntries(toValues(request))
    .filter((entry) => summaryFields.includes(entry.def.name))
    .sort((a, b) => summaryFields.indexOf(a.def.name) - summaryFields.indexOf(b.def.name))

  if (summary.length === 0 && !actions) return null

  return (
    <div className="row mb-3 no-gutters">
      {summary.map(({ def, value }, i) => (
        <div
          key={def.name}
          className={`col-6 col-sm-3 col-md-auto px-3 py-2${i !== summary.length - 1 ? ' border-end' : ''}`}
        >
          <small className="text-muted">{labelFor(def)}</small>
          <h5>{value}</h5>
        </div>
      ))}
      {actions && (
        <div className="col-12 col-md-auto ms-auto align-self-center d-flex gap-2 px-3 py-2">
          {actions}
        </div>
      )}
    </div>
  )
}

// Shows every field across all stages, with a dash for any not answered yet. RecordSummary shows
// the key fields above it.
export function RecordDetails({ request }: { request: SomiRequest }) {
  const values = toValues(request)
  const all = recordEntries(values)
  const calculations = somiCalculations(request)
  const estimateDetails = all.filter((entry) => estimateDetailFields.includes(entry.def.name))
  const entries = all.filter(
    (entry) =>
      !summaryFields.includes(entry.def.name) &&
      !estimateDetailFields.includes(entry.def.name) &&
      entry.def.name !== estimateField &&
      entry.def.name !== approvedField &&
      entry.def.name !== estimateFileField &&
      !unlistedFields.includes(entry.def.name),
  )

  return (
    <>
      {/* The calculations work from the approved months' estimate, so there's nothing to show
          until one is approved */}
      {approvedIndex(values.approvedMonths) >= 0 ? (
        <Row className="sm-gutters mb-3">
          {calculations.map(({ label, value, empty }) => (
            <Col key={label} xs={6} md={4} className="mb-2 mt-1">
              <Card className="h-100">
                <CardBody>
                  <small className="text-muted">{label}</small>
                  <h5 className={empty ? 'h4 bg-o-0' : 'h4'}>{value}</h5>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="secondary">
          Quantity and cost calculations will appear here when a quantity and manufacturing cost
          estimate is approved.
        </Alert>
      )}
      {/* Side by side from md up, stacked below that */}
      <Row className="mb-3">
        <Col md>
          {entries.length > 0 && (
            <div className="mb-3">
              <h4>SOMI Details</h4>
              <EntriesList entries={entries} />
            </div>
          )}
        </Col>
        <Col md>
          <div className="mb-3">
            <h4>Estimate Details</h4>
            <EntriesList entries={estimateDetails} />
          </div>
          <h4>Quantity Estimated</h4>
          <EstimatesTable values={values} />
        </Col>
      </Row>
    </>
  )
}

// The form's Quantity Estimated table turned on its side, so each month is a column, with a check
// on the months approved
function EstimatesTable({ values }: { values: DefaultValues<SomiFormValues> }) {
  const estimates = values.quantityEstimated ?? []

  const rows: { label: string; cell: (months: number, index: number) => ReactNode }[] = [
    { label: 'Months', cell: (months) => months },
    { label: 'Quantity', cell: (_, index) => displayCell(estimates[index]?.quantity) },
    {
      label: 'Manufacturing Cost',
      cell: (_, index) => displayCell(estimates[index]?.manufacturingCost),
    },
    {
      label: 'Approved',
      cell: (months) =>
        values.approvedMonths === monthsLabel(months) && (
          <i className="fas fa-check" aria-label="Approved" />
        ),
    },
  ]

  return (
    <Table className="border" bordered>
      <tbody>
        {rows.map(({ label, cell }) => (
          <tr key={label}>
            <th scope="row" className="bg-gray-100" style={{ width: '25%' }}>
              {label}
            </th>
            {estimatedMonths.map((months, index) => (
              <td key={months} style={{ width: '25%' }}>
                {cell(months, index)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function EntriesList({ entries }: { entries: Entry[] }) {
  return (

    <div className=''>
      {entries.map(({ def, value }) => (
        // <Col className='border-bottom border-end' md={6}>
        <Row key={def.name} className='h-100 border m-0'>
          <Col className="font-weight-700 bg-gray-100 p-2 border-end" xs={12} md={6}>
            {labelFor(def)}
          </Col>
          <Col className='p-2' xs={12} md={6} style={{ whiteSpace: 'pre-line' }}>
            {value}
          </Col>
        </Row>
        // </Col>
      ))}
    </div>
  )
}

function labelFor(def: FieldDef) {
  return def.shortLabel ?? def.label
}

// Returns '' when the field hasn't been filled in
function formatValue(def: FieldDef, value: unknown) {
  if (def.formatValue) return def.formatValue(value)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return Number.isNaN(value) ? '' : String(value)
  return typeof value === 'string' ? value : ''
}
