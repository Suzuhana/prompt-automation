import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import logger from './middleware/loggerMiddleware'
import { actionLogger } from './middleware/actionLogger'

import { createFileSlice, FileSlice } from '@renderer/features/file-explorer/slice/fileSlice'
import {
  createInstructionSlice,
  InstructionSlice
} from '@renderer/features/instruction/slice/instructionSlice'
import {
  createIgnorePatternsSlice,
  IgnorePatternsSlice
} from '@renderer/features/file-explorer/slice/ignorePatternsSlice'

export type AppState = FileSlice & InstructionSlice & IgnorePatternsSlice

export const useAppStore = create<AppState>()(
  devtools(
    logger(
      actionLogger((set, get, api) => ({
        ...createFileSlice(set, get, api),
        ...createInstructionSlice(set, get, api),
        ...createIgnorePatternsSlice(set, get, api)
      }))
    ),
    {
      name: 'AppStore'
    }
  )
)
