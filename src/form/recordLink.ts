const param = 'record'

// Takes the place of an id in the link to a record that hasn't been saved yet
export const newRecord = 'new'

export const listHref = window.location.pathname

export function recordHref(record: string) {
  return `?${param}=${encodeURIComponent(record)}`
}

export function currentRecord() {
  return new URLSearchParams(window.location.search).get(param)
}
