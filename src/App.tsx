import { currentRecord } from './form/recordLink'
import { RequestPage } from './form/RequestPage'
import { RequestsPage } from './form/RequestsPage'

function App() {
  const record = currentRecord()

  return record ? <RequestPage record={record} /> : <RequestsPage />
}

export default App
