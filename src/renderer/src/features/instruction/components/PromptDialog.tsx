import { useState, useImperativeHandle, forwardRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Prompt } from 'src/common/types/prompt-types'

export interface PromptDialogHandle {
  openDialog: (mode: 'create' | 'edit', promptData?: Prompt) => void
}

export interface PromptDialogProps {
  onSave: (data: {
    mode: 'create' | 'edit'
    promptData?: Prompt
    name: string
    type: string
    content: string
  }) => void
  // NEW: Add the existingPrompts prop for duplicate validation
  existingPrompts: Prompt[]
}

export const PromptDialog = forwardRef<PromptDialogHandle, PromptDialogProps>((props, ref) => {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [promptData, setPromptData] = useState<Prompt | undefined>(undefined)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [content, setContent] = useState('')
  // NEW: Add error state to store validation error messages
  const [error, setError] = useState('')

  useImperativeHandle(ref, () => ({
    openDialog: (dialogMode: 'create' | 'edit', data?: Prompt) => {
      setMode(dialogMode)
      if (dialogMode === 'edit' && data) {
        setPromptData(data)
        setName(data.name)
        setType(data.type)
        setContent(data.content)
      } else {
        setPromptData(undefined)
        setName('')
        setType('')
        setContent('')
      }
      // Clear any previous errors when opening the dialog
      setError('')
      setOpen(true)
    }
  }))

  const handleSave = async () => {
    // Validate empty fields
    if (!name.trim() || !type.trim() || !content.trim()) {
      setError('All fields are required.')
      return
    }
    // Validate for duplicate prompt names
    if (mode === 'create') {
      const duplicate = props.existingPrompts.find((p) => p.name === name)
      if (duplicate) {
        setError('Prompt name already exists. Please choose a different name.')
        return
      }
    } else if (mode === 'edit' && promptData && promptData.name !== name) {
      const duplicate = props.existingPrompts.find((p) => p.name === name)
      if (duplicate) {
        setError('Prompt name already exists. Please choose a different name.')
        return
      }
    }

    setError('')
    props.onSave({ mode, promptData, name, type, content })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Prompt' : 'Edit Prompt'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? "Create your prompt here. Click save when you're done"
              : 'Edit your prompt and click save'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="promptname" className="text-right">
              Prompt Name
            </Label>
            <Input
              id="promptname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prompttype" className="text-right">
              Prompt Type
            </Label>
            <Input
              id="prompttype"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="promptcontent" className="text-right">
              Prompt Content
            </Label>
            <Textarea
              id="promptcontent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter prompt content here..."
              className="col-span-3 w-full h-32 resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

PromptDialog.displayName = 'PromptDialog'
