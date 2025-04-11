import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { PreviewDirectoryGroup } from './PreviewGroup'
import { useAppStore } from '@renderer/store'
import { useGroupedSelectedFiles } from '../hooks/useGroupedSelectedFiles'

export function FileSelectionPreview(): JSX.Element {
  const handleCheckboxChange = useAppStore((state) => state.handleCheckboxChange)
  const groupedFiles = useGroupedSelectedFiles()

  return (
    <div className="flex flex-col gap-2 h-full">
      <h2 className="text-l font-semibold">Selected Files</h2>
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
