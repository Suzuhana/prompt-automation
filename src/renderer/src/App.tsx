import { FileExplorer } from './features/file-explorer/components/FileExplorer'
import { useFileWatcherSubscription } from './features/file-watcher/hook/useFileWatcherSubscription'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable'
import { FileSelectionPreview } from './features/file-selection-preview/components/FileSelectionPreview'
import { Toaster } from './components/ui/sonner'
import { Instruction } from './features/instruction/components/Instruction'

function App(): JSX.Element {
  useFileWatcherSubscription()

  return (
    <div>
      <div className="flex h-screen bg-background text-foreground">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={35} defaultSize={40} className="flex flex-col">
            <FileExplorer />
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel (takes remaining width) - Make it a flex column */}
          <ResizablePanel minSize={20} className="flex flex-col gap-4">
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50} minSize={20} className="p-3 flex flex-col gap-2">
                <Instruction></Instruction>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={50} minSize={20} className="p-3 flex flex-col">
                <FileSelectionPreview></FileSelectionPreview>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Toaster />
    </div>
  )
}

export default App
