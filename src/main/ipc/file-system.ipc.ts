import { ipcMain, dialog } from 'electron'
import normalizedFileMapService from '../services/normalized-file-map.service'
import { CHANNELS } from 'src/common/types/channel-names'
import { readFilesAsStrings } from '../services/file-reader.service'

/**
 * Initialize IPC handlers specific to file system actions
 */
export function initFileSystemIPC(): void {
  // Handler for opening file dialog
  ipcMain.handle(CHANNELS.FILE_SYSTEM_OPEN_DIALOG, async (_event, options) => {
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
  ipcMain.handle(
    CHANNELS.FILE_SYSTEM_GET_NORMALIZED_DIRECTORY_STRUCTURE,
    async (_event, dirPath: string) => {
      try {
        const { root, map } = await normalizedFileMapService.buildNormalizedMap(dirPath)
        return { root, map }
      } catch (error) {
        console.error('Error in get-normalized-directory-structure handler:', error)
        throw error
      }
    }
  )
  ipcMain.handle(CHANNELS.FILE_SYSTEM_READ_FILE_CONTENTS, async (_event, filePaths: string[]) => {
    try {
      return await readFilesAsStrings(filePaths)
    } catch (error) {
      console.error('Error in read-file-contents handler:', error)
      throw error
    }
  })
}

/**
 * Remove all file system IPC handlers
 */
export function removeFileSystemIPC(): void {
  ipcMain.removeHandler(CHANNELS.FILE_SYSTEM_OPEN_DIALOG)
  ipcMain.removeHandler(CHANNELS.FILE_SYSTEM_GET_NORMALIZED_DIRECTORY_STRUCTURE)
  ipcMain.removeHandler(CHANNELS.FILE_SYSTEM_READ_FILE_CONTENTS)
}
