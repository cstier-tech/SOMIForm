import { useEffect, useState } from 'react'
import { fetchChangeLog, type ChangeLogEntry, type SomiRequest } from './somiRequest'

export type ChangeLog = ReturnType<typeof useChangeLog>

// The record's logged changes, newest first; empty until they've loaded, and for a new record
// that hasn't been saved yet
export function useChangeLog(request: SomiRequest | undefined) {
  const [entries, setEntries] = useState<ChangeLogEntry[]>([])
  const [error, setError] = useState<string>()

  // The record is a new object after each save, so this loads again to show the new changes
  useEffect(() => {
    if (!request) return
    let current = true
    fetchChangeLog(request.id)
      .then((log) => {
        if (!current) return
        setEntries(log)
        setError(undefined)
      })
      .catch((e: Error) => current && setError(e.message))
    return () => {
      current = false
    }
  }, [request])

  return { entries, error }
}
