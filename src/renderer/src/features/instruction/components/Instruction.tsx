import { Fragment } from 'react'
import { Textarea } from '@renderer/components/ui/textarea'
import { useAppStore } from '@renderer/store'
import { BadgeWithActions } from '@renderer/components/ui/BadgeWithActions'
import { Edit, Trash2, Plus } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { usePrompts } from '../hooks/usePrompts'
import { PromptDialog } from './PromptDialog'

export function Instruction() {
  const instructions = useAppStore((state) => state.instructions)
  const setInstructions = useAppStore((state) => state.setInstructions)

  const { prompts, promptDialogRef, openDialog, handleSavePrompt, removePrompt } = usePrompts()

  return (
    <Fragment>
      <div className="flex items-center justify-between h-6">
        <div className="flex flex-row gap-2 items-center">
          <h2 className="text-l font-semibold">Instructions</h2>
          <Button variant="outline" className="w-6 h-6" onClick={() => openDialog('create')}>
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
                  onClick: () => openDialog('edit', prompt),
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

      <PromptDialog ref={promptDialogRef} onSave={handleSavePrompt} existingPrompts={prompts} />
    </Fragment>
  )
}
