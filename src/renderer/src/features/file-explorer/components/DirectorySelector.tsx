import { Button } from '@/components/ui/button'
import { Dialog } from '@radix-ui/react-dialog'
import { EllipsisVertical } from 'lucide-react'
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

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to permanently delete this file
              from our servers?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
