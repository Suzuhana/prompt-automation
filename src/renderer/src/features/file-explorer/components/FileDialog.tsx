import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area' // Import ScrollArea
import { FileTree } from './FileTree'
import { useFileDialog } from '../hook/useFileDialog'

export function FileDialog() {
  const { fileStructure, selectedFiles, isLoading, openFileDialog } = useFileDialog()

  // Get count of selected files/directories
  const selectedCount = Object.values(selectedFiles).filter(Boolean).length

  return (
    // Make FileDialog a flex column taking full available height
    <div className="flex flex-col h-full w-full p-4 gap-4">
      {/* Buttons section - stays at the top */}
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

      {/* File Tree Section - Use ScrollArea for content */}
      {fileStructure && !isLoading && (
        // ScrollArea takes the remaining vertical space.
        // Added min-h-0 to prevent flex item from growing beyond available space.
        <ScrollArea className="flex-grow min-h-0 border rounded-md bg-gray-50/30 dark:bg-gray-800/20">
          {/* Inner padding for the scrollable content */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </p>
            </div>
            {/* FileTree is now directly inside the scrollable area's padded div */}
            <FileTree
              node={fileStructure}
              selectedFiles={selectedFiles}
              // Level prop is optional and defaults to 0 in FileTree
            />
          </div>
        </ScrollArea>
      )}

      {/* Action button section - stays at the bottom */}
      {fileStructure && !isLoading && selectedCount > 0 && (
        <div className="mt-auto flex justify-end">
          {/* Use mt-auto to push to bottom */}
          <Button
            onClick={() => {
              // Example action: Log selected file paths
              const selectedPaths = Object.entries(selectedFiles)
                .filter(([, isSelected]) => isSelected)
                .map(([path]) => path)
              console.log('Processing selected paths:', selectedPaths)
              // Add your actual processing logic here
            }}
          >
            Process Selected ({selectedCount})
          </Button>
        </div>
      )}
    </div>
  )
}
