import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { PreviewDirectoryGroup } from './PreviewGroup'
import { useAppStore } from '@renderer/store'

export function FileSelectionPreview(): JSX.Element {
  const handleCheckboxChange = useAppStore((state) => state.handleCheckboxChange)

  return (
    <div className="flex flex-col gap-2 h-full">
      <h2 className="text-xl font-semibold">Selected Files</h2>
      <ScrollArea className="flex-grow min-h-0 pr-3">
        <div className="flex flex-col gap-2">
          <PreviewDirectoryGroup
            onDeselect={(path) => {
              handleCheckboxChange(path, false)
            }}
            directoryPath="test/aste/asts/a/at"
            files={[
              { path: 'test', name: 'test.ts', tokenSize: 280 },
              { path: 'test', name: 'test2.ts', tokenSize: 280 },
              { path: 'test', name: 'test3.ts', tokenSize: 280 }
            ]}
          ></PreviewDirectoryGroup>
          <PreviewDirectoryGroup
            onDeselect={(path) => {
              handleCheckboxChange(path, false)
            }}
            directoryPath="test/aste/asts/a/at"
            files={[
              { path: 'test', name: 'test.ts', tokenSize: 280 },
              { path: 'test', name: 'test2.ts', tokenSize: 280 },
              { path: 'test', name: 'test3.ts', tokenSize: 280 }
            ]}
          ></PreviewDirectoryGroup>
          <PreviewDirectoryGroup
            onDeselect={(path) => {
              handleCheckboxChange(path, false)
            }}
            directoryPath="test/aste/asts/a/at"
            files={[
              { path: 'test', name: 'test.ts', tokenSize: 280 },
              { path: 'test', name: 'test2.ts', tokenSize: 280 },
              { path: 'test', name: 'test3.ts', tokenSize: 280 }
            ]}
          ></PreviewDirectoryGroup>
        </div>
      </ScrollArea>
    </div>
  )
}
