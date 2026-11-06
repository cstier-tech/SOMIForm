import { useEffect, useState } from 'react'
import { Button, Card, CardHeader, ListGroup, ListGroupItem, Tooltip } from 'oa'
import { downloadDocument, findDocument, type DocumentKind } from './documentFiles'
import type { SomiRequest } from './somiRequest'

const documents: { kind: DocumentKind; label: string }[] = [
  { kind: 'estimate', label: 'Estimate' },
  { kind: 'agreement', label: 'Customer Agreement' },
]

// The record's documents, each with a download button once uploaded, for the page's sidebar
export function DocumentsList({ request }: { request: SomiRequest }) {
  return (
    <Card className="mb-3">
      <CardHeader className="font-weight-600">Documents</CardHeader>
      <ListGroup variant="flush">
        {documents.map(({ kind, label }) => (
          <DocumentItem key={kind} request={request} kind={kind} label={label} />
        ))}
      </ListGroup>
    </Card>
  )
}

type DocumentItemProps = {
  request: SomiRequest
  kind: DocumentKind
  label: string
}

function DocumentItem({ request, kind, label }: DocumentItemProps) {
  // undefined while checking, null when there's none
  const [path, setPath] = useState<string | null>()
  const [error, setError] = useState<string>()

  // The record is a new object after each save, so this looks again after an upload
  useEffect(() => {
    let current = true
    findDocument(request.id, kind)
      .then((found) => {
        if (!current) return
        setPath(found ?? null)
        setError(undefined)
      })
      .catch((e: Error) => current && setError(`Could not check for the document: ${e.message}`))
    return () => {
      current = false
    }
  }, [request, kind])

  const download = async () => {
    if (!path) return
    setError(undefined)
    try {
      await downloadDocument(path)
    } catch (e) {
      setError(`Could not download the document: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <ListGroupItem>
      <div className="d-flex justify-content-between align-items-center gap-2">
        <span>{label}</span>
        <div className="d-flex align-items-center gap-1">
          {path === null && <span className="text-muted">Not Submitted</span>}
          {path && (
            <Tooltip title={`Download ${label}`}>
              <Button
                variant="secondary"
                size="sm"
                className="btn-icon"
                onClick={download}
                aria-label={`Download ${label}`}
              >
                <i className="fas fa-download"></i>
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </ListGroupItem>
  )
}
