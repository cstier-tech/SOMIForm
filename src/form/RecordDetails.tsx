import { get } from 'react-hook-form'
import { Card, CardHeader, Col, ListGroup, ListGroupItem, Row } from 'oa'
import { stageFields, type FieldDef } from './fields'
import { toValues, type SomiRequest } from './somiRequest'
import { stageLabels, stages } from './stages'

type RecordDetailsProps = {
  // The record as stored
  request: SomiRequest
}

// Lists what each stage has saved; fields left empty are skipped
export function RecordDetails({ request }: RecordDetailsProps) {
  const values = toValues(request)

  const groups = stages
    .map((stage) => ({
      stage,
      entries: stageFields[stage]
        .map((def) => ({ def, value: formatValue(def, get(values, def.name)) }))
        .filter((entry) => entry.value),
    }))
    .filter((group) => group.entries.length)

  if (!groups.length) {
    return <p className="text-muted mb-0">Nothing entered yet.</p>
  }

  return groups.map((group) => (

    <div>
      <h4>{stageLabels[group.stage]}</h4>
      <ListGroup variant="flush" key={group.stage}>
        {group.entries.map(({ def, value }) => (
          <ListGroupItem key={def.name}>
            <Row>
              <Col className='font-weight-700' xs={12} md={6}>
                {def.label}
              </Col>
              <Col xs={12} md={6} style={{ whiteSpace: 'pre-line' }}>
                {value}
              </Col>
            </Row>
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  ))
}

// Returns '' when the field hasn't been filled in
function formatValue(def: FieldDef, value: unknown) {
  if (def.formatValue) return def.formatValue(value)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return Number.isNaN(value) ? '' : String(value)
  return typeof value === 'string' ? value : ''
}
