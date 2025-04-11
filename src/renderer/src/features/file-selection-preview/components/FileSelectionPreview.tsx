import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { PreviewDirectoryGroup } from './PreviewGroup'
import { useAppStore } from '@renderer/store'
import { useGroupedSelectedFiles } from '../hooks/useGroupedSelectedFiles'
import { formatTokenSize } from '../utils/formatTokenSize'

export function FileSelectionPreview(): JSX.Element {
  const handleCheckboxChange = useAppStore((state) => state.handleCheckboxChange)
  const groupedFiles = useGroupedSelectedFiles()

  // Compute the total number of selected files and the total token count.
  const selectedFilesCount = Object.values(groupedFiles).reduce(
    (acc, files) => acc + files.length,
    0
  )
  const totalTokenCount = Object.values(groupedFiles).reduce(
    (acc, files) => acc + files.reduce((subAcc, file) => subAcc + file.tokenSize, 0),
    0
  )

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-l font-semibold">Selected Files</h2>
        <div className="py-1 px-2 flex items-center space-x-2 text-sm bg-gray-200 rounded-sm">
          <div> {selectedFilesCount} files</div>
          <div className="w-px h-4 bg-gray-400" />
          <div>{formatTokenSize(totalTokenCount)}</div>
        </div>
      </div>
      <ScrollArea className="flex-grow min-h-0 pr-3">
        <div className="flex flex-col gap-2">
          {Object.entries(groupedFiles).map(([directoryPath, files]) => (
            <PreviewDirectoryGroup
              key={directoryPath}
              onDeselect={(path) => {
                handleCheckboxChange(path, false)
              }}
              directoryPath={directoryPath}
              files={files}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
