import { Textarea } from './components/ui/textarea'
import { FileDialog } from './features/file-explorer/components/FileDialog'
import { useFileWatcherSubscription } from './features/file-watcher/hook/useFileWatcherSubscription'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable'
import { FileSelectionPreview } from './features/file-selection-preview/components/FileSelectionPreview'

function App(): JSX.Element {
  useFileWatcherSubscription()

  return (
    <div className="flex h-screen bg-background text-foreground">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={35} defaultSize={40} className="flex flex-col">
          <FileDialog />
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel (takes remaining width) - Make it a flex column */}
        <ResizablePanel minSize={20} className="flex flex-col gap-4">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50} minSize={20} className="p-3 flex flex-col gap-2">
              <h2 className="text-l font-semibold">Instructions</h2>
              <Textarea
                placeholder="Enter text here..."
                className="flex-grow resize-none" // flex-grow makes it expand, resize-none disables manual resizing handle
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={20} className="p-3 flex flex-col">
              <FileSelectionPreview></FileSelectionPreview>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default App
