import { supabase } from '../supabase'

// The documents a record can have, each kept in its own folder under the record's id
export type DocumentKind = 'estimate' | 'agreement'

function bucket() {
  return supabase.storage.from('SOMIRequestDocs')
}

// Each document goes in its own folder, under the name it was uploaded with, so it downloads with
// that name
function documentFolder(id: string, kind: DocumentKind) {
  return `${id}/${kind}`
}

// The record's files of that kind, newest first. There's normally one, but an older one can be left
// behind if removing it failed.
async function listDocuments(id: string, kind: DocumentKind) {
  const { data, error } = await bucket().list(documentFolder(id, kind), {
    sortBy: { column: 'updated_at', order: 'desc' },
  })
  if (error) throw new Error(error.message)
  // Folders have no id, and Supabase keeps a placeholder file in otherwise empty folders
  return data.filter((file) => file.id && !file.name.startsWith('.')).map((file) => file.name)
}

// Saves the file as the record's estimate, replacing any uploaded before
export async function uploadEstimate(id: string, file: File) {
  const folder = documentFolder(id, 'estimate')
  const { error } = await bucket().upload(`${folder}/${file.name}`, file, {
    upsert: true,
    contentType: file.type || undefined,
  })
  if (error) throw new Error(`The estimate could not be uploaded: ${error.message}`)

  // Not worth failing the save over: the newest file is the one that's downloaded either way
  const older = (await listDocuments(id, 'estimate').catch(() => [])).filter(
    (name) => name !== file.name,
  )
  if (older.length) await bucket().remove(older.map((name) => `${folder}/${name}`))
}

// Removes all of the record's documents of that kind
export async function removeDocuments(id: string, kind: DocumentKind) {
  const folder = documentFolder(id, kind)
  const names = await listDocuments(id, kind)
  if (!names.length) return
  const { error } = await bucket().remove(names.map((name) => `${folder}/${name}`))
  if (error) throw new Error(error.message)
}

// The storage path of the record's document of that kind, or undefined if none has been uploaded
export async function findDocument(id: string, kind: DocumentKind) {
  const [newest] = await listDocuments(id, kind)
  return newest && `${documentFolder(id, kind)}/${newest}`
}

// Downloads the file at the path findDocument returned
export async function downloadDocument(path: string) {
  const { data, error } = await bucket().createSignedUrl(path, 60, { download: true })
  if (error) throw new Error(error.message)
  window.location.assign(data.signedUrl)
}
