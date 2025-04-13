import { ElectronAPI } from '@electron-toolkit/preload'
import { FileSystemAPI, PromptAPI } from './preload-api.types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fileSystem: FileSystemAPI
      prompt: PromptAPI
    }
  }
}

export {}
