import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@renderer/store'
import { PromptDialogHandle } from '../components/PromptDialog'
import { Prompt } from 'src/common/types/prompt-types'

export function usePrompts() {
  const prompts = useAppStore((state) => state.prompts)
  const loadPrompts = useAppStore((state) => state.loadPrompts)
  const addPrompt = useAppStore((state) => state.addPrompt)
  const removePrompt = useAppStore((state) => state.removePrompt)
  const editPrompt = useAppStore((state) => state.editPrompt)
  const togglePromptEnabled = useAppStore((state) => state.togglePromptEnabled)

  const promptDialogRef = useRef<PromptDialogHandle>(null)

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  const openDialog = useCallback((mode: 'create' | 'edit', promptData?: Prompt) => {
    promptDialogRef.current?.openDialog(mode, promptData)
  }, [])

  const handleSavePrompt = useCallback(
    async ({
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
        await editPrompt(promptData.name, name, type, content)
      }
    },
    [addPrompt, editPrompt]
  )

  return {
    prompts,
    promptDialogRef,
    openDialog,
    handleSavePrompt,
    removePrompt,
    togglePromptEnabled
  }
}
