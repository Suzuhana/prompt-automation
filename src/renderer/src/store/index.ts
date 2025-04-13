import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import logger from './middleware/loggerMiddleware'
import { actionLogger } from './middleware/actionLogger'

import { createFileSlice, FileSlice } from '@renderer/features/file-explorer/slice/fileSlice'
import {
  createInstructionSlice,
  InstructionSlice
} from '@renderer/features/instruction/slice/instructionSlice'

export type AppState = FileSlice & InstructionSlice

export const useAppStore = create<AppState>()(
  devtools(
    logger(
      actionLogger((set, get, api) => ({
        ...createFileSlice(set, get, api),
        ...createInstructionSlice(set, get, api)
      }))
    ),
    {
      name: 'AppStore'
    }
  )
)
