import { ipcRenderer } from 'electron'
import { FileNode } from 'src/common/types/file'

/**
 * File system APIs for the renderer process
 */
export const fileSystemAPI = {
  /**
   * Opens a file dialog and returns the selected path
   * @param options Dialog configuration options
   * @returns Promise resolving to the selected path or null if canceled
   */
  openFileDialog: (options: Electron.OpenDialogOptions): Promise<string | null> => {
    return ipcRenderer.invoke('open-file-dialog', options)
  },

  /**
   * Gets the directory structure for a given path
   * @param dirPath Path to the directory or file
   * @returns Promise resolving to the directory structure
   */
  getDirectoryStructure: (dirPath: string): Promise<FileNode> => {
    return ipcRenderer.invoke('get-directory-structure', dirPath)
  }
}

// Add TypeScript declarations
declare global {
  interface Window {
    api: {
      fileSystem: typeof fileSystemAPI
    }
  }
}
