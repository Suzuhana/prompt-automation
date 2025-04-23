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
  togglePromptEnabled: (name: string) => Promise<void>
}

export const createInstructionSlice: StateCreator<InstructionSlice, [], [], InstructionSlice> = (
  set
) => ({
  instructions: '',
  prompts: [],

  setInstructions: (text: string) => {
    set({ instructions: text })
  },

  // Load and migrate existing prompts, ensuring `enabled` is always set.
  loadPrompts: async () => {
    const stored = (await window.api.fileBasedStore.get('prompts')) as Prompt[] | undefined
    if (stored && Array.isArray(stored)) {
      const migrated = stored.map((p) => ({
        ...p,
        enabled: p.enabled ?? true
      }))
      // Persist migration
      await window.api.fileBasedStore.set('prompts', migrated)
      set({ prompts: migrated })
    }
  },

  // Adds new prompt, defaulting to enabled.
  addPrompt: async (name: string, type: string, content: string) => {
    const existing = (await window.api.fileBasedStore.get('prompts')) as Prompt[] | undefined
    const newPrompt: Prompt = { name, type, content, enabled: true }
    const updated = existing && Array.isArray(existing) ? [...existing, newPrompt] : [newPrompt]

    await window.api.fileBasedStore.set('prompts', updated)
    set({ prompts: updated })
  },

  // Removes a prompt by name.
  removePrompt: async (name: string) => {
    const existing = (await window.api.fileBasedStore.get('prompts')) as Prompt[] | undefined
    if (existing && Array.isArray(existing)) {
      const updated = existing.filter((p) => p.name !== name)
      await window.api.fileBasedStore.set('prompts', updated)
      set({ prompts: updated })
    }
  },

  // Edits a prompt's name/type/content, preserving its enabled state.
  editPrompt: async (oldName: string, name: string, type: string, content: string) => {
    const existing = (await window.api.fileBasedStore.get('prompts')) as Prompt[] | undefined
    if (existing && Array.isArray(existing)) {
      const updated = existing.map((p) =>
        p.name === oldName ? { name, type, content, enabled: p.enabled } : p
      )
      await window.api.fileBasedStore.set('prompts', updated)
      set({ prompts: updated })
    }
  },

  // Toggles the `enabled` flag on a prompt.
  togglePromptEnabled: async (name: string) => {
    const existing = (await window.api.fileBasedStore.get('prompts')) as Prompt[] | undefined
    if (existing && Array.isArray(existing)) {
      const updated = existing.map((p) => (p.name === name ? { ...p, enabled: !p.enabled } : p))
      await window.api.fileBasedStore.set('prompts', updated)
      set({ prompts: updated })
    }
  }
})
