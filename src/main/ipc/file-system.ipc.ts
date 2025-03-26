import { ipcMain, dialog } from 'electron'
import { FileSystemService } from '../services/file-system.service'

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

  // Handler for getting directory structure
  ipcMain.handle('get-directory-structure', async (_event, dirPath) => {
    try {
      return FileSystemService.getDirectoryStructure(dirPath)
    } catch (error) {
      console.error('Error in get-directory-structure handler:', error)
      throw error
    }
  })
}

/**
 * Remove all file system IPC handlers
 */
export function removeFileSystemIPC(): void {
  ipcMain.removeHandler('open-file-dialog')
  ipcMain.removeHandler('get-directory-structure')
}
