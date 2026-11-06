import type { ReactNode } from 'react'
import { get, type DefaultValues } from 'react-hook-form'
import { Card, CardBody, CardHeader, Col, Row, Table } from 'oa'
import { hiddenFieldNames, stageFields, type FieldDef } from './fields'
import { EstimateDownload } from './EstimateDownload'
import { displayCell, estimatedMonths, monthsLabel } from './quantityEstimated'
import { somiCalculations } from './somiCalculations'
import { toValues, type SomiRequest } from './somiRequest'
import { stages } from './stages'
import type { SomiFormValues } from './types'
import type { ChangeLog } from './useChangeLog'
import { WorkflowSteps } from './WorkflowSteps'

type RecordDetailsProps = {
  // The record as stored
  request: SomiRequest
  // From useChangeLog
  changeLog: ChangeLog
  // Shown at the end of the summary row, such as the Approve and Deny buttons
  actions?: ReactNode
}

// Shown across the top, as well as in SOMI Details
const summaryFields: FieldDef['name'][] = ['itemName', 'date', 'customer', 'customerNumber']

// Shown in their own section, under SOMI Details
const agreementFields: FieldDef['name'][] = [
  'understandsObsoleteResponsibility',
  'signedSomiAgreement',
]

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
// only appearing when it's Yes, and Confirm TSP through Sales 2's approval in the Progress Tracker.
const unlistedFields: FieldDef['name'][] = ['reorderPointsEstablished', 'salesApprovesTsp']

type Entry = { def: FieldDef; value: string }

// Shows every field across all stages, with a dash for any not answered yet
export function RecordDetails({
  request,
  changeLog,
  actions,
}: RecordDetailsProps) {
  const values = toValues(request)
  const hidden = hiddenFieldNames(values)

  const all = stages
    .flatMap((stage) => stageFields[stage])
    .filter((def) => !hidden.has(def.name))
    .map((def) => ({ def, value: formatValue(def, get(values, def.name)) || '' }))//empty string for no value
  const summary = all.filter((entry) => summaryFields.includes(entry.def.name))
  const calculations = somiCalculations(request)
  const agreements = all.filter((entry) => agreementFields.includes(entry.def.name))
  const estimateDetails = all.filter((entry) => estimateDetailFields.includes(entry.def.name))
  const entries = all.filter(
    (entry) =>
      !agreementFields.includes(entry.def.name) &&
      !estimateDetailFields.includes(entry.def.name) &&
      entry.def.name !== estimateField &&
      entry.def.name !== approvedField &&
      entry.def.name !== estimateFileField &&
      !unlistedFields.includes(entry.def.name),
  )

  const actionsCol = actions && (
    <div className="col-12 col-md-auto ms-auto align-self-center d-flex gap-2 px-3 py-2">
      {actions}
    </div>
  )

  return (
    <>
      {(summary.length > 0 || actionsCol) && (
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
          {actionsCol}
        </div>
      )}
      {/* The Progress Tracker to the left of the calculation cards from lg up, stacked above them
          below that */}
      <Row className="mb-3">
        <Col lg={5}>
          <Card className="mb-3">
            <CardHeader className='font-weight-600'>
              Progress Tracker
            </CardHeader>
            <WorkflowSteps request={request} changeLog={changeLog.entries} />
          </Card>
        </Col>
        <Col lg={7}>
          <Row className="sm-gutters">
            {calculations.map(({ label, value, empty }) => (
              <Col key={label} xs={6} lg={4} className="mb-2 mt-1">
                <Card className="h-100">
                  <CardBody>
                    <small className="text-muted">{label}</small>
                    <h5 className={empty ? 'h4 bg-o-0' : 'h4'}>{value}</h5>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      {/* Side by side from md up, stacked below that */}
      <Row className="mb-3">
        <Col md>
          {entries.length > 0 && (
            <div className="mb-3">
              <h4>SOMI Details</h4>
              <EntriesList entries={entries} />
            </div>
          )}
          {agreements.length > 0 && (
            <div className='mb-3'>
              <h4>Customer Agreements</h4>
              <EntriesList entries={agreements} />
            </div>
          )}
        </Col>
        <Col md>
          <div className="mb-3">
            {/* The download button sits at the end of the heading's line */}
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              <h4 className="mb-0">Estimate Details</h4>
              <EstimateDownload request={request} />
            </div>
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
