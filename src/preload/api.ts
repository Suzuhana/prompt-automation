import { ipcRenderer } from 'electron'
import { FileNode, NormalizedDirectoryStructure } from 'src/common/types/file-tree-types'
import { DirectoryChangedData } from 'src/common/types/file-watcher-types'

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
  },

  // Start watching a directory. Returns a watch ID.
  watchDirectory: (directory: string): Promise<string> => {
    return ipcRenderer.invoke('start-watch-directory', directory)
  },

  // Stop watching a directory using its watch ID.
  stopWatchDirectory: (watchId: string): Promise<boolean> => {
    return ipcRenderer.invoke('stop-watch-directory', watchId)
  },

  // Listen for directory change events.
  subscriptToDirectoryChanged: (callback: (data: DirectoryChangedData) => void): void => {
    ipcRenderer.on('directory-changed', (_event, data) => callback(data))
  },
  cancelSubDirectoryChanged: (): void => {
    ipcRenderer.off('directory-changed', () => {})
  },

  // NEW: Get the normalized directory structure.
  getNormalizedDirectoryStructure: (dirPath: string): Promise<NormalizedDirectoryStructure> => {
    return ipcRenderer.invoke('get-normalized-directory-structure', dirPath)
  },
  // NEW: Subscribe to normalized directory structure updates.
  subscriptToNormalizedDirectoryChanged: (
    callback: (data: NormalizedDirectoryStructure) => void
  ): void => {
    ipcRenderer.on('normalized-directory-changed', (_event, data: NormalizedDirectoryStructure) =>
      callback(data)
    )
  },
  // NEW: Cancel subscription for normalized directory structure updates.
  cancelSubNormalizedDirectoryChanged: (): void => {
    ipcRenderer.off('normalized-directory-changed', () => {})
  }
}
