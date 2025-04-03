import { ElectronAPI } from '@electron-toolkit/preload'
import { FileSystemAPI } from './preload-api.types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fileSystem: FileSystemAPI
    }
  }
}

export {}
