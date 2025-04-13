import { Textarea } from '@renderer/components/ui/textarea'
import { Fragment } from 'react/jsx-runtime'
import { useAppStore } from '@renderer/store'

export function Instruction() {
  const instructions = useAppStore((state) => state.instructions)
  const setInstructions = useAppStore((state) => state.setInstructions)

  return (
    <Fragment>
      <h2 className="text-l font-semibold">Instructions</h2>
      <Textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Enter text here..."
        className="flex-grow resize-none"
      />
    </Fragment>
  )
}
