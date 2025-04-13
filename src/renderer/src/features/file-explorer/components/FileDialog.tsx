import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileTree } from './FileTree'
import { useFileDialog } from '../hook/useFileDialog'
import { useAppStore } from '@renderer/store'
import { toast } from 'sonner'

export function FileDialog() {
  const { rootPath, isLoading, openFileDialog } = useFileDialog()
  const entities = useAppStore((state) => state.entities)
  const instructions = useAppStore((state) => state.instructions)
  const selectedCount = Object.values(entities).filter((node) => node.selected === true).length

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      {/* Buttons section */}
      <div className="flex space-x-4">
        <Button onClick={() => openFileDialog('directory')} disabled={isLoading} variant="default">
          Select Directory
        </Button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center flex-grow">
          <p>Loading...</p>
        </div>
      )}

      {/* File Tree Section */}
      {rootPath && !isLoading && (
        <ScrollArea className="flex-grow min-h-0 border rounded-md bg-gray-50/30 dark:bg-gray-800/20">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </p>
            </div>
            <FileTree nodePath={rootPath} />
          </div>
        </ScrollArea>
      )}

      {/* Action button section */}
      {rootPath && !isLoading && selectedCount > 0 && (
        <div className="mt-auto flex justify-end">
          <Button
            onClick={() => {
              const selectedPaths = Object.values(entities)
                .filter((node) => node.selected === true && node.type === 'file')
                .map((node) => node.path)

              window.api.prompt
                .createPrompt({
                  selectedFilePaths: selectedPaths,
                  userInstruction: instructions.trim()
                })
                .then((prompt) => {
                  window.api.clipboard
                    .sendToClipboard(prompt)
                    .then(() => {
                      toast('Prompt generated and copied to clipboard', {
                        action: {
                          label: 'DISMISS',
                          onClick: () => {}
                        }
                      })
                    })
                    .catch((err) => {
                      console.error('Error sending prompt to clipboard:', err)
                    })
                })
                .catch((err) => {
                  console.error('Error generating prompt:', err)
                })
            }}
          >
            Prompt Generation ({selectedCount})
          </Button>
        </div>
      )}
    </div>
  )
}
