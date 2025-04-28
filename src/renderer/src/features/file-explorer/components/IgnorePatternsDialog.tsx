import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
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
import { toast } from 'sonner'
import { FileText, Search, X } from 'lucide-react'
import { DropdownMenuItem } from '@renderer/components/ui/dropdown-menu'

type IgnorePatternsDialogProps = {
  /** The currently selected root directory path, used for reloading the tree on save. */
  rootPath: string | null
  /** Function to reload the file tree with a specific path. */
  loadWithPath: (filePath: string) => Promise<void>
}

/**
 * A dialog component for configuring file and directory ignore patterns.
 * Allows users to add, remove, filter, and load patterns from a .gitignore file.
 */
export function IgnorePatternsDialog({ rootPath, loadWithPath }: IgnorePatternsDialogProps) {
  const {
    ignorePatterns,
    loadIgnorePatterns,
    addIgnorePattern,
    removeIgnorePattern,
    saveIgnorePatterns
  } = useAppStore()

  const [newPattern, setNewPattern] = useState<string>('')
  const [filter, setFilter] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  /**
   * Loads persisted ignore patterns when the dialog opens.
   */
  useEffect(() => {
    if (isDialogOpen) {
      loadIgnorePatterns()
    }
  }, [isDialogOpen, loadIgnorePatterns])

  const filteredPatterns = ignorePatterns.filter((pattern) => pattern.includes(filter))

  /**
   * Adds a single pattern entered in the text box after trimming and validation.
   * Shows a toast notification if the pattern is empty or already exists.
   */
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

  /**
   * Opens a file dialog for the user to select a .gitignore file.
   * Reads the file, parses its lines (ignoring comments and empty lines),
   * and merges the unique patterns into the current list.
   * Shows toast notifications for success or failure.
   */
  const loadPatternsFromGitignore = async () => {
    try {
      // 1. Ask the user to choose a .gitignore file
      const filePath = await window.api.fileSystem.openFileDialog({
        title: 'Select a .gitignore file',
        properties: ['openFile'],
        filters: [{ name: '.gitignore', extensions: ['gitignore', 'txt'] }]
      })

      // User cancelled the dialog
      if (!filePath) {
        return
      }

      // 2. Read the chosen file using the FS bridge
      const contentsMap = await window.api.fileSystem.readFileContents([filePath])
      const content = contentsMap[filePath]

      if (!content) {
        toast.error('Unable to read the selected .gitignore file')
        return
      }

      // 3. Parse lines, ignoring comments/empties, and merge
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
      console.error('Failed to load patterns from .gitignore:', err)
      toast.error('Failed to load patterns from the selected .gitignore')
    }
  }

  /**
   * Saves the current set of ignore patterns, reloads the file tree if a root path exists,
   * and closes the dialog.
   */
  const handleSaveChanges = async () => {
    try {
      await saveIgnorePatterns()
      if (rootPath !== null) {
        await loadWithPath(rootPath) // Reload the tree with new patterns
      }
      setIsDialogOpen(false)
      toast.success('Ignore patterns saved successfully.')
    } catch (error) {
      console.error('Failed to save ignore patterns:', error)
      toast.error('Failed to save ignore patterns.')
    }
  }

  /**
   * Discards any changes made in the dialog by reloading the persisted patterns
   * and closes the dialog.
   */
  const handleCancel = () => {
    loadIgnorePatterns() // Revert to persisted state
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {/* This DropdownMenuItem will trigger the dialog */}
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Configure Ignore Patterns
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Ignore Patterns</DialogTitle>
          <DialogDescription>
            Set patterns for files and directories you want to exclude from the file tree. Uses glob
            patterns.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Input to add new pattern */}
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Add new pattern (e.g., node_modules/** or *.log)"
              className="flex-1"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
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
              {filteredPatterns.length === 0 && ignorePatterns.length > 0 ? (
                <p className="text-sm text-muted-foreground text-center p-4">
                  No patterns match your filter.
                </p>
              ) : filteredPatterns.length === 0 && ignorePatterns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center p-4">
                  No ignore patterns defined.
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredPatterns.map((pattern) => (
                    <div
                      key={pattern} // Use pattern itself as key assuming uniqueness managed by store
                      className="flex items-center justify-between bg-muted/50 p-2 rounded-md text-sm hover:bg-muted/80"
                    >
                      <span className="break-all">{pattern}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        aria-label={`Remove ${pattern}`}
                        onClick={() => removeIgnorePattern(pattern)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
          <Button variant="ghost" type="button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
