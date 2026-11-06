import { useEffect, useState } from 'react'
import { Button } from 'oa'
import { downloadEstimate, findEstimate } from './estimateFile'
import type { SomiRequest } from './somiRequest'

// Disabled until the record has an estimate uploaded
export function EstimateDownload({ request }: { request: SomiRequest }) {
  const [path, setPath] = useState<string>()
  const [error, setError] = useState<string>()

  // The record is a new object after each save, so this looks again after an upload
  useEffect(() => {
    let current = true
    findEstimate(request.id)
      .then((found) => current && setPath(found))
      .catch((e: Error) => current && setError(`Could not check for an estimate: ${e.message}`))
    return () => {
      current = false
    }
  }, [request])

  const download = async () => {
    if (!path) return
    setError(undefined)
    try {
      await downloadEstimate(path)
    } catch (e) {
      setError(`Could not download the estimate: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <div className={`text-end ${!path ? 'd-none' : ''}`}>
      <Button onClick={download} variant='link' size='sm' className='p-0 text-decoration-none font-weight-600'>
        <span>Download Estimate</span>
        <i className="fas fa-download"></i>
      </Button>
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  )
}
