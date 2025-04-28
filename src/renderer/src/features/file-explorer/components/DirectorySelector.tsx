import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@radix-ui/react-dialog'
import { EllipsisVertical, FileText, Search, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useAppStore } from '@renderer/store'
import { toast } from 'sonner' // NEW

type DirectorySelectorProps = {
  openFileDialog: (mode: 'directory') => void
  isLoading: boolean
  loadWithPath: (filePath: string) => Promise<void>
}

export function DirectorySelector({
  openFileDialog,
  isLoading,
  loadWithPath
}: DirectorySelectorProps) {
  const {
    rootPath,
    ignorePatterns,
    loadIgnorePatterns,
    addIgnorePattern,
    removeIgnorePattern,
    saveIgnorePatterns
  } = useAppStore()

  const [newPattern, setNewPattern] = useState<string>('')
  const [filter, setFilter] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  /* load persisted patterns whenever the dialog opens */
  useEffect(() => {
    if (isDialogOpen) {
      loadIgnorePatterns()
    }
  }, [isDialogOpen, loadIgnorePatterns])

  const filteredPatterns = ignorePatterns.filter((pattern) => pattern.includes(filter))

  /* ────────────────────────────────────────────────────────────── *
   * Add single pattern entered in the text box                     *
   * ────────────────────────────────────────────────────────────── */
  const handleAdd = () => {
    const trimmed = newPattern.trim()
    if (!trimmed) return
    if (ignorePatterns.includes(trimmed)) {
      toast.info(`Pattern “${trimmed}” already exists`)
      return
    }
    addIgnorePattern(trimmed)
    setNewPattern('')
  }

  /* ────────────────────────────────────────────────────────────── *
   * Load & merge patterns from .gitignore in the selected folder   *
   * ────────────────────────────────────────────────────────────── */
  /* ────────────────────────────────────────────────────────────── *
   * Load & merge patterns from a user-selected .gitignore file     *
   * ────────────────────────────────────────────────────────────── */
  const loadPatternsFromGitignore = async () => {
    try {
      /* 1. Ask the user to choose a .gitignore file */
      const filePath = await window.api.fileSystem.openFileDialog({
        title: 'Select a .gitignore file',
        properties: ['openFile'],
        filters: [{ name: '.gitignore', extensions: ['gitignore', 'txt'] }]
      })

      /* User cancelled the dialog */
      if (!filePath) {
        return
      }

      /* 2. Read the chosen file using the existing FS bridge */
      const contentsMap = await window.api.fileSystem.readFileContents([filePath])
      const content = contentsMap[filePath]

      if (!content) {
        toast.error('Unable to read the selected .gitignore file')
        return
      }

      /* 3. Parse lines, ignoring comments/empties, and merge */
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))

      let added = 0
      lines.forEach((pattern) => {
        if (!ignorePatterns.includes(pattern)) {
          addIgnorePattern(pattern)
          added++
        }
      })

      toast.success(added ? `Added ${added} pattern(s)` : 'All patterns already present')
    } catch (err) {
      console.error(err)
      toast.error('Failed to load patterns from the selected .gitignore')
    }
  }

  return (
    <div className="flex space-x-4 items-center justify-between">
      <Button onClick={() => openFileDialog('directory')} disabled={isLoading} variant="default">
        Select Directory
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DialogTrigger asChild>
              <DropdownMenuItem>Configure Ignore Patterns</DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Ignore Patterns</DialogTitle>
            <DialogDescription>
              Set patterns for files and directories you want to exclude from the file tree.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Input to add new pattern */}
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Add new pattern (e.g., node_modules/**)"
                className="flex-1"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
              />
              <Button size="sm" onClick={handleAdd}>
                Add
              </Button>
            </div>

            {/* Filter input for patterns */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter patterns..."
                className="pl-8"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {/* List of active patterns */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Active Patterns:</p>
                <span className="text-xs text-muted-foreground">
                  {ignorePatterns.length} patterns
                </span>
              </div>

              <ScrollArea className="h-80 rounded-md border p-2">
                <div className="space-y-2">
                  {filteredPatterns.map((pattern, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                    >
                      <span className="text-sm">{pattern}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label={`Remove ${pattern}`}
                        onClick={() => removeIgnorePattern(pattern)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Load patterns from .gitignore */}
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={loadPatternsFromGitignore}>
                <FileText className="mr-2 h-4 w-4" />
                Load from .gitignore
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                loadIgnorePatterns() // revert to persisted
                setIsDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await saveIgnorePatterns()
                if (rootPath !== null) {
                  await loadWithPath(rootPath)
                }
                setIsDialogOpen(false)
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
