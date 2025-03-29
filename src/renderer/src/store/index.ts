import { create } from 'zustand'
import { devtools } from 'zustand/middleware' // Optional: For Redux DevTools

import { createFileSlice, FileSlice } from '@renderer/features/file-explorer/slice/fileSlice'
import logger from './middleware/loggerMiddleware'
import { actionLogger } from './middleware/actionLogger'
import {
  createFileSelectionSlice,
  FileSelectionSlice
} from '@renderer/features/file-explorer/slice/fileSelectionSlice'

// Define the type for the combined state
export type AppState = FileSlice & FileSelectionSlice
// Create the store using the combined slice creators
export const useAppStore = create<AppState>()(
  // Optional: Wrap with devtools for Redux DevTools integration
  devtools(
    // Persist middleware can also be nested here if needed
    logger(
      actionLogger((set, get, api) => ({
        // Combine slice creators using the spread operator
        ...createFileSlice(set, get, api),
        ...createFileSelectionSlice(set, get, api)
        // You can add root-level state or actions here if needed
        // Example:
        // appName: "My Zustand App",
        // initialize: () => { /* ... */ }
      }))
    ),
    {
      name: 'AppStore' // Custom name for the store in DevTools
      // Optional: Specify which actions/states to show in DevTools
      // serialize: { options: true },
    }
  )
)
