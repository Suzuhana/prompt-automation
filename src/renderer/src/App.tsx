import { FileDialog } from './features/file-explorer/components/FileDialog'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">File Explorer</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <FileDialog />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
