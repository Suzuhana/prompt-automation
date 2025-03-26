import { Button } from '@/components/ui/button'
import { FileTree } from './FileTree'
import type { SelectedFiles } from '@/types/file'
import { useFileDialog } from '../hook/useFileDialog'

export function FileDialog() {
  const { fileStructure, selectedFiles, isLoading, openFileDialog, setSelectedFiles } =
    useFileDialog()

  // Handle file/directory selection/deselection
  const handleSelectionChange = (path: string, selected: boolean) => {
    setSelectedFiles((prev: SelectedFiles) => ({
      ...prev,
      [path]: selected
    }))
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
          <div className="border rounded-md p-4 max-h-[60vh] overflow-auto">
            <FileTree
              node={fileStructure}
              selectedFiles={selectedFiles}
              onSelectionChange={handleSelectionChange}
              level={0}
            />
          </div>
        </div>
      )}

      {fileStructure && !isLoading && selectedCount > 0 && (
        <div className="mt-4">
          <Button onClick={() => console.log('Selected files:', selectedFiles)}>
            Process Selected ({selectedCount})
          </Button>
        </div>
      )}
    </div>
  )
}
