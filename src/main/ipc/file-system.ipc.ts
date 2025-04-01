import { ipcMain, dialog } from 'electron'
import normalizedFileMapService from '../services/normalized-file-map.service'

/**
 * Initialize IPC handlers specific to file system actions
 */
export function initFileSystemIPC(): void {
  // Handler for opening file dialog
  ipcMain.handle('open-file-dialog', async (_event, options) => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(options)
      if (canceled || filePaths.length === 0) {
        return null
      }
      return filePaths[0]
    } catch (error) {
      console.error('Error in open-file-dialog handler:', error)
      throw error
    }
  })
  ipcMain.handle('get-normalized-directory-structure', async (_event, dirPath: string) => {
    try {
      const { root, map } = await normalizedFileMapService.buildNormalizedMap(dirPath)
      return { root, map }
    } catch (error) {
      console.error('Error in get-normalized-directory-structure handler:', error)
      throw error
    }
  })
}

/**
 * Remove all file system IPC handlers
 */
export function removeFileSystemIPC(): void {
  ipcMain.removeHandler('open-file-dialog')
  ipcMain.removeHandler('get-normalized-directory-structure')
}
