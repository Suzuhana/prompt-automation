import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Textarea } from './components/ui/textarea'
import { FileDialog } from './features/file-explorer/components/FileDialog'

function App(): JSX.Element {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <PanelGroup direction="horizontal">
        <Panel minSize={35} defaultSize={40} className="flex flex-col">
          <FileDialog />
        </Panel>

        <PanelResizeHandle className="w-1 border-l border-r border-border cursor-col-resize" />

        {/* Right Panel (takes remaining width) - Make it a flex column */}
        <Panel minSize={20} className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Content Area</h2>
          {/* Textarea - Use flex-grow to make it fill available vertical space */}
          <Textarea
            placeholder="Enter text here..."
            className="flex-grow resize-none" // flex-grow makes it expand, resize-none disables manual resizing handle
          />
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default App
