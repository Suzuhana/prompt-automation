import { Textarea } from '@renderer/components/ui/textarea'
import { Fragment } from 'react/jsx-runtime'
import { useAppStore } from '@renderer/store'
import { BadgeWithActions } from '@renderer/components/ui/BadgeWithActions'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { Label } from '@renderer/components/ui/label'
import { Input } from '@renderer/components/ui/input'

export function Instruction() {
  const instructions = useAppStore((state) => state.instructions)
  const setInstructions = useAppStore((state) => state.setInstructions)

  return (
    <Fragment>
      <div className="flex items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          <h2 className="text-l font-semibold">Instructions</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-6 h-6">
                <Plus />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Prompt</DialogTitle>
                <DialogDescription>
                  Create your prompt here. Click save when you&apos;re done
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="promptname" className="text-right">
                    Prompt Name
                  </Label>
                  <Input id="promptname" value="Engineer" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prompttype" className="text-right">
                    Prompt Type
                  </Label>
                  <Input id="prompttype" value="meta-prompt" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="promptcontent" className="text-right">
                    Prompt Content
                  </Label>
                  <Textarea
                    id="promptcontent"
                    placeholder="Enter prompt content here..."
                    className="flex-grow resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-row gap-2">
          <BadgeWithActions
            label="Custom Prompt"
            actions={[
              {
                label: 'Edit',
                onClick: () => console.log('Edit clicked'),
                icon: <Edit size={12} />
              },
              {
                label: 'Remove',
                onClick: () => console.log('Remove clicked'),
                icon: <Trash2 size={12} />
              }
            ]}
          />
          <BadgeWithActions
            label="Custom Prompt"
            actions={[
              {
                label: 'Edit',
                onClick: () => console.log('Edit clicked'),
                icon: <Edit size={12} />
              },
              {
                label: 'Remove',
                onClick: () => console.log('Remove clicked'),
                icon: <Trash2 size={12} />
              }
            ]}
          />
        </div>
      </div>
      <Textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Enter user instruction here..."
        className="flex-grow resize-none"
      />
    </Fragment>
  )
}
