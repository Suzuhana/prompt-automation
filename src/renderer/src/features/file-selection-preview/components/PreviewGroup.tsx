import { File, Folder, Trash } from 'lucide-react'
import { PreviewFile } from '../hooks/useGroupedSelectedFiles'
import { formatTokenSize } from '../utils/formatTokenSize'

interface PreviewDirectoryGroupProps {
  directoryPath: string
  files: PreviewFile[]
  onDeselect: (path: string) => void
}

export function PreviewDirectoryGroup({
  directoryPath,
  files,
  onDeselect
}: PreviewDirectoryGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="bg-blue-500/15 flex flex-row items-center rounded-sm px-2">
        <Folder size={16} className="mr-2 text-blue-500" />
        <p className="font-semibold">{directoryPath}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {files.map((file) => (
          <div
            key={file.name}
            className="w-60 p-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 group"
          >
            <div className="flex-grow flex flex-col items-start">
              <div className="flex flex-row items-center">
                <File size={16} className="mr-2 text-gray-500" />
                <p className="font-normal">{file.name}</p>
              </div>
              <p className="text-xs text-gray-400">{formatTokenSize(file.tokenSize)}</p>
            </div>
            <div
              onClick={() => {
                onDeselect(file.path)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash size={16} className="text-red-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
