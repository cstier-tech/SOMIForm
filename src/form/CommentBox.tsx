import { useState, type FormEvent } from 'react'
import { Alert, Button, Feedback, FormControl, FormGroup, FormLabel } from 'oa'

type CommentBoxProps = {
  // Saves the comment; throws if it couldn't be saved
  onSubmit: (comment: string) => Promise<void>
}

// A Comment button that opens a text area to write and submit a comment in place
export function CommentBox({ onSubmit }: CommentBoxProps) {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  const close = () => {
    setOpen(false)
    setComment('')
    setInvalid(false)
    setError(undefined)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = comment.trim()
    if (!trimmed) {
      setInvalid(true)
      return
    }
    setSubmitting(true)
    setError(undefined)
    try {
      await onSubmit(trimmed)
      close()
    } catch (e) {
      setError(`Could not save: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <Button variant="primary" className="mt-3" onClick={() => setOpen(true)}>
        Comment
      </Button>
    )
  }

  return (
    <form noValidate className="mt-3" onSubmit={submit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <FormGroup controlId="newComment">
        <FormLabel>Comment</FormLabel>
        <FormControl
          as="textarea"
          autoFocus
          value={comment}
          onChange={(e) => {
            setComment(e.target.value)
            setInvalid(false)
          }}
          isInvalid={invalid}
        />
        <Feedback type="invalid">Comments are required</Feedback>
      </FormGroup>
      <div className="d-flex gap-2">
        <Button type="submit" variant="primary" disabled={submitting}>
          Submit
        </Button>
        <Button variant="secondary" disabled={submitting} onClick={close}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
