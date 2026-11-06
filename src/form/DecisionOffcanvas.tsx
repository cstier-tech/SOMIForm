import { Offcanvas, OffcanvasCloser } from 'oa'
import { DecisionForm } from './DecisionForm'
import type { Decision } from './somiRequest'
import { stageLabels, type Stage } from './stages'
import type { SomiFormValues } from './types'

type DecisionOffcanvasProps = {
  show: boolean
  stage: Stage
  decision: Decision
  // The title for submit, as on the button that opened it
  submitLabel?: string
  error?: string
  onClose: () => void
  onSubmit: (data: SomiFormValues, decision: Decision) => Promise<void>
}

// The stage's decision form in a panel from the right. Expects a FormProvider above it, which holds
// the values for DecisionForm.
export function DecisionOffcanvas({
  show,
  stage,
  decision,
  submitLabel,
  error,
  onClose,
  onSubmit,
}: DecisionOffcanvasProps) {
  return (
    <Offcanvas show={show} placement="right" size="lg">
      <div className="d-flex align-items-center justify-content-between border-bottom p-3">
        <h5 className="mb-0">{title(stage, decision, submitLabel)}</h5>
        <OffcanvasCloser onClick={onClose} />
      </div>
      <div className="p-3">
        <DecisionForm stage={stage} decision={decision} error={error} onSubmit={onSubmit} />
      </div>
    </Offcanvas>
  )
}

function title(stage: Stage, decision: Decision, submitLabel?: string) {
  switch (decision) {
    case 'approve':
      return `Approve ${stageLabels[stage]}`
    case 'deny':
      return `Deny ${stageLabels[stage]}`
    case 'cancel':
      return 'Cancel Request'
    case 'submit':
      return submitLabel ?? `Submit ${stageLabels[stage]}`
  }
}
