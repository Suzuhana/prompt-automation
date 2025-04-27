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

type DirectorySelectorProps = {
  openFileDialog: (mode: 'directory') => void
  isLoading: boolean
}

export function DirectorySelector({ openFileDialog, isLoading }: DirectorySelectorProps) {
  return (
    <div className="flex space-x-4 items-center justify-between">
      <Button onClick={() => openFileDialog('directory')} disabled={isLoading} variant="default">
        Select Directory
      </Button>

      <Dialog>
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
              <Input placeholder="Add new pattern (e.g., node_modules/**)" className="flex-1" />
              <Button size="sm">Add</Button>
            </div>

            {/* Filter input for patterns */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter patterns..." className="pl-8" />
            </div>

            {/* List of active patterns with ScrollArea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Active Patterns:</p>
                <span className="text-xs text-muted-foreground">10 patterns</span>
              </div>

              <ScrollArea className="h-80 rounded-md border p-2">
                <div className="space-y-2">
                  {/* Mock patterns - would be replaced with actual filtered data */}
                  {[
                    'node_modules/**',
                    'build/**',
                    '.git/**',
                    '*.log',
                    'dist/**',
                    'coverage/**',
                    '.env*',
                    '*.lock',
                    '*.tsbuildinfo',
                    '.DS_Store'
                  ].map((pattern, index) => (
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
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Load from .gitignore */}
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Load from .gitignore
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
