import { useState } from 'react'
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'oa'
import { sendBackToStep, type SomiRequest } from './somiRequest'
import type { Stage } from './stages'
import { progressStatuses, workflow, type Status } from './status'

type BackToStepModalProps = {
  request: SomiRequest
  // The status the step being gone back to moves the record to; the modal is shown while it's set
  step?: Status
  // The stage sending it back
  stage: Stage
  onClose: () => void
  // Given the record as stored once it's been sent back
  onSentBack: (request: SomiRequest) => void
}

// Asks before sending the record back to a step, since that deletes what was entered from it on
export function BackToStepModal({ request, step, stage, onClose, onSentBack }: BackToStepModalProps) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string>()
  const index = step ? progressStatuses.indexOf(step) : -1
  const undone = workflow.filter((_, i) => i >= index)
  // The status the request goes back to
  const previous = progressStatuses[index - 1]

  const close = () => {
    setError(undefined)
    onClose()
  }

  const send = async () => {
    if (!step) return
    setSending(true)
    setError(undefined)
    try {
      onSentBack(await sendBackToStep(request, step, stage))
    } catch (e) {
      setError(`Could not go back: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal show={!!step} onHide={close}>
      <ModalHeader closeButton>
        <ModalTitle>Back to {undone[0]?.step?.label}?</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>
          This step and every step after it will be undone and this request will go back to{' '}
          <strong>{previous}</strong>.
        </p>
        <p className="mb-0">
          Are you sure you want to go back to <strong>{previous}</strong>? This can't be undone.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={close} disabled={sending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={send} disabled={sending}>
          Yes
        </Button>
      </ModalFooter>
    </Modal>
  )
}
