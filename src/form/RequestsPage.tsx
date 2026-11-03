import { useEffect, useState } from 'react'
import { Alert, Button } from 'oa'
import { PageContent } from './PageContent'
import { newRecord, recordHref } from './recordLink'
import { RequestsTable } from './RequestsTable'
import { fetchRequests, type SomiRequest } from './somiRequest'

export function RequestsPage() {
  const [requests, setRequests] = useState<SomiRequest[]>()
  const [loadError, setLoadError] = useState<string>()

  useEffect(() => {
    fetchRequests()
      .then(setRequests)
      .catch((error: Error) => setLoadError(error.message))
  }, [])

  return (
    <PageContent>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">SOMI Form</h1>
        <Button href={recordHref(newRecord)}>Add Record</Button>
      </div>
      {loadError && <Alert variant="danger">Could not load records: {loadError}</Alert>}
      {requests && <RequestsTable requests={requests} />}
      {!requests && !loadError && <p className="text-muted">Loading…</p>}
    </PageContent>
  )
}
