import { StateCreator } from 'zustand'

export interface InstructionSlice {
  instructions: string
  setInstructions: (text: string) => void
}

export const createInstructionSlice: StateCreator<InstructionSlice, [], [], InstructionSlice> = (
  set
) => ({
  instructions: '',
  setInstructions: (text: string) => {
    set({ instructions: text })
  }
})
