import { supabase } from '../supabase'

function bucket() {
  return supabase.storage.from('SOMIRequestDocs')
}

// Each record's estimate goes in its own folder, under the name it was uploaded with, so it
// downloads with that name
function estimateFolder(id: string) {
  return `${id}/estimate`
}

// The record's estimates, newest first. There's normally one, but an older one can be left behind
// if removing it failed.
async function listEstimates(id: string) {
  const { data, error } = await bucket().list(estimateFolder(id), {
    sortBy: { column: 'updated_at', order: 'desc' },
  })
  if (error) throw new Error(error.message)
  // Folders have no id, and Supabase keeps a placeholder file in otherwise empty folders
  return data.filter((file) => file.id && !file.name.startsWith('.')).map((file) => file.name)
}

// Saves the file as the record's estimate, replacing any uploaded before
export async function uploadEstimate(id: string, file: File) {
  const folder = estimateFolder(id)
  const { error } = await bucket().upload(`${folder}/${file.name}`, file, {
    upsert: true,
    contentType: file.type || undefined,
  })
  if (error) throw new Error(`The estimate could not be uploaded: ${error.message}`)

  // Not worth failing the save over: the newest file is the one that's downloaded either way
  const older = (await listEstimates(id).catch(() => [])).filter((name) => name !== file.name)
  if (older.length) await bucket().remove(older.map((name) => `${folder}/${name}`))
}

// The storage path of the record's estimate, or undefined if none has been uploaded
export async function findEstimate(id: string) {
  const [newest] = await listEstimates(id)
  return newest && `${estimateFolder(id)}/${newest}`
}

// Downloads the file at the path findEstimate returned
export async function downloadEstimate(path: string) {
  const { data, error } = await bucket().createSignedUrl(path, 60, { download: true })
  if (error) throw new Error(error.message)
  window.location.assign(data.signedUrl)
}
