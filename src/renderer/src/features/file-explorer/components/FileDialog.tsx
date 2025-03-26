import { Button } from '@/components/ui/button'
import { FileTree } from './FileTree' // Ensure correct import if path changed
import type { SelectedFiles } from '@/types/file'
import { useFileDialog } from '../hook/useFileDialog'

export function FileDialog() {
  const { fileStructure, selectedFiles, isLoading, openFileDialog, setSelectedFiles } =
    useFileDialog()

  /**
   * Handle multiple path selections in one update.
   * This avoids repeated state updates when selecting or deselecting large directories.
   */
  const handleBulkSelectionChange = (paths: string[], selected: boolean) => {
    setSelectedFiles((prev: SelectedFiles) => {
      // Create a mutable copy for efficient updates
      const updated = { ...prev }
      paths.forEach((p) => {
        updated[p] = selected
      })
      return updated
    })
  }

  // Get count of selected files/directories
  const selectedCount = Object.values(selectedFiles).filter(Boolean).length

  return (
    <div className="w-full p-4">
      <div className="flex space-x-4 mb-6">
        <Button onClick={() => openFileDialog('file')} disabled={isLoading} variant="outline">
          Select File
        </Button>
        <Button onClick={() => openFileDialog('directory')} disabled={isLoading} variant="default">
          Select Directory
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-20">
          {/* Consider using a spinner component here */}
          <p>Loading...</p>
        </div>
      )}

      {fileStructure && !isLoading && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-lg">
              {fileStructure.type === 'directory' ? 'Directory' : 'File'}: {fileStructure.name}
            </h3>
            <p className="text-sm text-gray-500">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="border rounded-md p-4 max-h-[60vh] overflow-auto bg-gray-50/30 dark:bg-gray-800/20">
            {/* Removed level prop, FileTree now defaults to 0 */}
            <FileTree
              node={fileStructure}
              selectedFiles={selectedFiles}
              onBulkSelectionChange={handleBulkSelectionChange}
            />
          </div>
        </div>
      )}

      {/* Action button section */}
      {fileStructure && !isLoading && selectedCount > 0 && (
        <div className="mt-6 flex justify-end">
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
