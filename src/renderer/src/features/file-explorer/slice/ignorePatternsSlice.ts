import type { StateCreator } from 'zustand'

export interface IgnorePatternsSlice {
  ignorePatterns: string[]
  loadIgnorePatterns: () => Promise<void>
  addIgnorePattern: (pattern: string) => void
  removeIgnorePattern: (pattern: string) => void
  setIgnorePatterns: (patterns: string[]) => void
  saveIgnorePatterns: () => Promise<void>
}

export const createIgnorePatternsSlice: StateCreator<IgnorePatternsSlice> = (set, get) => ({
  // in-memory list of patterns
  ignorePatterns: [],

  // load from file-based store under key "ignorePatterns"
  loadIgnorePatterns: async () => {
    const stored = (await window.api.fileBasedStore.get('ignorePatterns')) as string[] | undefined
    const patterns = Array.isArray(stored) ? stored : []
    set({ ignorePatterns: patterns })
  },

  // append only in-memory
  addIgnorePattern: (pattern: string) => {
    set((state) => ({
      ignorePatterns: [...state.ignorePatterns, pattern]
    }))
  },

  // remove only in-memory
  removeIgnorePattern: (pattern: string) => {
    set((state) => ({
      ignorePatterns: state.ignorePatterns.filter((p) => p !== pattern)
    }))
  },

  // overwrite in-memory list (used for cancel or external reload)
  setIgnorePatterns: (patterns: string[]) => {
    set({ ignorePatterns: patterns })
  },

  // persist current in-memory list to disk
  saveIgnorePatterns: async () => {
    const patterns = get().ignorePatterns
    await window.api.fileBasedStore.set('ignorePatterns', patterns)
  }
})
