import { FileNode } from 'src/common/types/file-tree-types'
import { WatcherEvent } from './file-watcher-types'

/**
 * Extension for the Electron API
 */
declare global {
  interface Window {
    api: {
      fileSystem: {
        /**
         * Opens a file dialog for selecting files or directories
         */
        openFileDialog: (options: Electron.OpenDialogOptions) => Promise<string | null>

        /**
         * Gets the directory structure for a given path
         */
        getDirectoryStructure: (dirPath: string) => Promise<FileNode>
        watchDirectory: (directory: string) => Promise<string>
        stopWatchDirectory: (watchId: string) => Promise<boolean>
        onDirectoryChanged: (
          callback: (data: { watchId: string; events: WatcherEvent[] }) => void
        ) => void
      }
    }
  }
}

export {}
