import { FileNode } from './file'

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
      }
    }
  }
}

export {}
