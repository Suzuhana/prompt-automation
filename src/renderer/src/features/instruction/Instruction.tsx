import { Textarea } from '@renderer/components/ui/textarea'
import { Fragment } from 'react/jsx-runtime'
import { useAppStore } from '@renderer/store'
import { BadgeWithActions } from '@renderer/components/ui/BadgeWithActions'
import { Edit, Trash2 } from 'lucide-react'

export function Instruction() {
  const instructions = useAppStore((state) => state.instructions)
  const setInstructions = useAppStore((state) => state.setInstructions)

  return (
    <Fragment>
      <div className="flex items-center justify-between">
        <h2 className="text-l font-semibold">Instructions</h2>
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
