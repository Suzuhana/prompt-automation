import { Prompt } from 'src/common/types/prompt-types'
import { StateCreator } from 'zustand'

export interface InstructionSlice {
  instructions: string
  prompts: Prompt[]
  setInstructions: (text: string) => void
  loadPrompts: () => Promise<void>
  addPrompt: (name: string, type: string, content: string) => Promise<void>
  removePrompt: (name: string) => Promise<void>
  editPrompt: (oldName: string, name: string, type: string, content: string) => Promise<void>
}

export const createInstructionSlice: StateCreator<InstructionSlice, [], [], InstructionSlice> = (
  set
) => ({
  instructions: '',
  prompts: [],
  setInstructions: (text: string) => {
    set({ instructions: text })
  },

  // Loads prompts from the file-based KV store into the local state.
  loadPrompts: async () => {
    const storedPrompts = (await window.api.fileBasedStore.get('prompts')) as Prompt[] | undefined
    if (storedPrompts && Array.isArray(storedPrompts)) {
      set({ prompts: storedPrompts })
    }
  },

  // Adds a new prompt to the file-based KV store and updates local state.
  addPrompt: async (name: string, type: string, content: string) => {
    const existing = (await window.api.fileBasedStore.get('prompts')) as Prompt[] | undefined
    const newPrompt: Prompt = { name, type, content }
    const updated = existing && Array.isArray(existing) ? [...existing, newPrompt] : [newPrompt]

    await window.api.fileBasedStore.set('prompts', updated)
    set({ prompts: updated })
  },

  // Removes a prompt (by name) from the file-based KV store and updates local state.
  removePrompt: async (name: string) => {
    const existing = (await window.api.fileBasedStore.get('prompts')) as Prompt[] | undefined
    if (existing && Array.isArray(existing)) {
      const updated = existing.filter((p) => p.name !== name)
      await window.api.fileBasedStore.set('prompts', updated)
      set({ prompts: updated })
    }
  },

  // Edits an existing prompt by matching its original name.
  editPrompt: async (oldName: string, name: string, type: string, content: string) => {
    const existing = (await window.api.fileBasedStore.get('prompts')) as Prompt[] | undefined
    if (existing && Array.isArray(existing)) {
      const updated = existing.map((p) => (p.name === oldName ? { name, type, content } : p))
      await window.api.fileBasedStore.set('prompts', updated)
      set({ prompts: updated })
    }
  }
})
