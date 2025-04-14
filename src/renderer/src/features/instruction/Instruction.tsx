import { useEffect, Fragment, useRef } from 'react'
import { Textarea } from '@renderer/components/ui/textarea'
import { useAppStore } from '@renderer/store'
import { BadgeWithActions } from '@renderer/components/ui/BadgeWithActions'
import { Edit, Trash2, Plus } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { PromptDialog, PromptDialogHandle } from './PromptDialog'
import { Prompt } from 'src/common/types/prompt-types'

export function Instruction() {
  const instructions = useAppStore((state) => state.instructions)
  const setInstructions = useAppStore((state) => state.setInstructions)
  const prompts = useAppStore((state) => state.prompts)
  const addPrompt = useAppStore((state) => state.addPrompt)
  const removePrompt = useAppStore((state) => state.removePrompt)
  const editPrompt = useAppStore((state) => state.editPrompt)
  const loadPrompts = useAppStore((state) => state.loadPrompts)

  const promptDialogRef = useRef<PromptDialogHandle>(null)

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  const handleSavePrompt = async ({
    mode,
    promptData,
    name,
    type,
    content
  }: {
    mode: 'create' | 'edit'
    promptData?: Prompt
    name: string
    type: string
    content: string
  }) => {
    if (mode === 'create') {
      await addPrompt(name, type, content)
    } else if (promptData) {
      // For edit mode, use the old prompt name to locate the prompt to update.
      await editPrompt(promptData.name, name, type, content)
    }
  }

  return (
    <Fragment>
      <div className="flex items-center justify-between h-6">
        <div className="flex flex-row gap-2 items-center">
          <h2 className="text-l font-semibold">Instructions</h2>
          <Button
            variant="outline"
            className="w-6 h-6"
            onClick={() => promptDialogRef.current?.openDialog('create')}
          >
            <Plus />
          </Button>
        </div>
        <div className="flex flex-row gap-2">
          {prompts.map((prompt, index) => (
            <BadgeWithActions
              key={index}
              label={prompt.name}
              actions={[
                {
                  label: 'Edit',
                  onClick: () => promptDialogRef.current?.openDialog('edit', prompt),
                  icon: <Edit size={12} />
                },
                {
                  label: 'Remove',
                  onClick: async () => await removePrompt(prompt.name),
                  icon: <Trash2 size={12} />
                }
              ]}
            />
          ))}
        </div>
      </div>
      <Textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Enter user instruction here..."
        className="flex-grow resize-none"
      />
      <PromptDialog ref={promptDialogRef} onSave={handleSavePrompt} />
    </Fragment>
  )
}
