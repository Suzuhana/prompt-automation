import { NormalizedDirectoryStructure } from 'src/common/types/file-tree-types'
import { DirectoryChangedData } from './file-watcher-types'

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
        watchDirectory: (directory: string) => Promise<string>
        stopWatchDirectory: (watchId: string) => Promise<boolean>
        subscriptToDirectoryChanged: (callback: (data: DirectoryChangedData) => void) => void
        cancelSubDirectoryChanged: () => void
        /**
         * Gets the normalized file map for a given directory.
         */
        getNormalizedDirectoryStructure: (dirPath: string) => Promise<NormalizedDirectoryStructure>
        /**
         * Subscribe to normalized directory structure updates.
         */
        subscriptToNormalizedDirectoryChanged: (
          callback: (data: NormalizedDirectoryStructure) => void
        ) => void
        /**
         * Cancel subscription for normalized directory structure updates.
         */
        cancelSubNormalizedDirectoryChanged: () => void
      }
    }
  }
}
