import { Alert, Offcanvas, OffcanvasCloser } from 'oa'
import { SomiForm } from './SomiForm'
import type { Decision } from './somiRequest'
import { stageLabels, type Stage } from './stages'
import type { SomiFormValues } from './types'

type DecisionOffcanvasProps = {
  show: boolean
  stage: Stage
  decision: Decision
  error?: string
  onClose: () => void
  onSubmit: (data: SomiFormValues) => Promise<void>
}

// Expects a FormProvider above it, which holds the values for SomiForm
export function DecisionOffcanvas({
  show,
  stage,
  decision,
  error,
  onClose,
  onSubmit,
}: DecisionOffcanvasProps) {
  return (
    <Offcanvas show={show} placement="right" size="lg">
      <div className="d-flex align-items-center justify-content-between border-bottom p-3">
        <h5 className="mb-0">
          {decision === 'deny' ? 'Deny' : 'Approve'} {stageLabels[stage]}
        </h5>
        <OffcanvasCloser onClick={onClose} />
      </div>
      <div className="p-3">
        {error && <Alert variant="danger">{error}</Alert>}
        <SomiForm stage={stage} decision={decision} onSubmit={onSubmit} />
      </div>
    </Offcanvas>
  )
}
