import { Textarea } from './components/ui/textarea'
import { FileDialog } from './features/file-explorer/components/FileDialog'
// import { Textarea } from '@/components/ui/textarea'

function App(): JSX.Element {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-1/3 flex flex-col border-r border-border">
        <FileDialog />
      </div>

      {/* Right Panel (takes remaining width) - Make it a flex column */}
      <div className="flex-grow p-6 flex flex-col gap-4">
        {' '}
        <h2 className="text-xl font-semibold">Content Area</h2>
        {/* Textarea - Use flex-grow to make it fill available vertical space */}
        <Textarea
          placeholder="Enter text here..."
          className="flex-grow resize-none" // flex-grow makes it expand, resize-none disables manual resizing handle
        />
      </div>
    </div>
  )
}

export default App
