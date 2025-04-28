import { Button } from '@/components/ui/button'
import { EllipsisVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { useAppStore } from '@renderer/store'
import { IgnorePatternsDialog } from './IgnorePatternsDialog' // NEW IMPORT

type DirectorySelectorProps = {
  /** Function to trigger the native file dialog for selecting a directory. */
  openFileDialog: (mode: 'directory') => void
  /** Indicates if the file tree is currently being loaded or refreshed. */
  isLoading: boolean
  /** Function to reload the file tree with a specific path. */
  loadWithPath: (filePath: string) => Promise<void>
}

/**
 * Renders the primary "Select Directory" button and a dropdown menu
 * containing options like configuring ignore patterns.
 */
export function DirectorySelector({
  openFileDialog,
  isLoading,
  loadWithPath
}: DirectorySelectorProps) {
  const { rootPath } = useAppStore()

  return (
    <div className="flex space-x-4 items-center justify-between">
      <Button onClick={() => openFileDialog('directory')} disabled={isLoading} variant="default">
        Select Directory
      </Button>

      {/* Dropdown menu for additional options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading} aria-label="More options">
            <EllipsisVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* Renders the dialog trigger and the dialog itself */}
          <IgnorePatternsDialog rootPath={rootPath} loadWithPath={loadWithPath} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
