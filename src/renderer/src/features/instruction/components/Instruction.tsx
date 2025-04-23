import { Fragment } from 'react'
import { Textarea } from '@renderer/components/ui/textarea'
import { useAppStore } from '@renderer/store'
import { BadgeWithActions } from '@renderer/components/ui/BadgeWithActions'
import { Edit, EyeOff, Plus } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { usePrompts } from '../hooks/usePrompts'
import { PromptDialog } from './PromptDialog'
import { PromptPopover } from './PromptPopover'

export function Instruction() {
  const instructions = useAppStore((state) => state.instructions)
  const setInstructions = useAppStore((state) => state.setInstructions)

  const { prompts, promptDialogRef, openDialog, handleSavePrompt, togglePromptEnabled } =
    usePrompts()

  // Show only enabled prompts as badges
  const enabledPrompts = prompts.filter((p) => p.enabled)

  return (
    <Fragment>
      <div className="flex items-center justify-between h-6">
        <div className="flex flex-row gap-2 items-center">
          <h2 className="text-l font-semibold">Instructions</h2>
          <Button variant="outline" className="w-6 h-6" onClick={() => openDialog('create')}>
            <Plus size={12} />
          </Button>
        </div>
        <div className="flex flex-row gap-2 items-center">
          {/* Quick-view badges for enabled prompts */}
          <div className="flex flex-row gap-2">
            {enabledPrompts.map((prompt) => (
              <BadgeWithActions
                key={prompt.name}
                label={prompt.name}
                actions={[
                  {
                    label: 'Edit',
                    onClick: () => openDialog('edit', prompt),
                    icon: <Edit size={12} />
                  },
                  {
                    label: 'Deselect',
                    onClick: () => togglePromptEnabled(prompt.name),
                    icon: <EyeOff size={12} />
                  }
                ]}
              />
            ))}
          </div>
          {/* Full management popover */}
          <PromptPopover />
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
