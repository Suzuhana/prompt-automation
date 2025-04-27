import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { estimateTextTokens } from 'src/common/utils/token-estimator'
import { formatTokenSize } from '@renderer/features/file-selection-preview/utils/formatTokenSize'
import { CheckedNormalizedFileNode } from '../slice/type'

type PromptActionProps = {
  entities: {
    [path: string]: CheckedNormalizedFileNode
  }
  instructions: string
}

export function PromptAction({ entities, instructions }: PromptActionProps) {
  const handlePromptGeneration = useCallback(() => {
    const selectedPaths = Object.values(entities)
      .filter((node) => node.selected === true && node.type === 'file')
      .map((node) => node.path)

    window.api.prompt
      .createPrompt({ selectedFilePaths: selectedPaths, userInstruction: instructions.trim() })
      .then((prompt) => {
        const estimatedTokens = estimateTextTokens(prompt)
        window.api.clipboard
          .sendToClipboard(prompt)
          .then(() => {
            toast(
              `Prompt generated with approximately ${formatTokenSize(
                estimatedTokens
              )} tokens and copied to clipboard`,
              { action: { label: 'DISMISS', onClick: () => {} } }
            )
          })
          .catch((err) => console.error('Error sending prompt to clipboard:', err))
      })
      .catch((err) => console.error('Error generating prompt:', err))
  }, [entities, instructions])

  const selectedCount = Object.values(entities).filter((node) => node.selected).length
  if (selectedCount === 0) return null

  return (
    <div className="mt-auto flex justify-end">
      <Button onClick={handlePromptGeneration}>Prompt Generation ({selectedCount})</Button>
    </div>
  )
}
