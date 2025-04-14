import { ipcMain } from 'electron'
import { fileBasedStoreService } from '../services/file-based-store.service'
import { CHANNELS } from 'src/common/types/channel-names'

/**
 * Initializes IPC handlers for the file-based store:
 *  - Get a value by key
 *  - Set a value for key
 *  - Delete a key
 */
export async function initFileBasedStoreIPC(): Promise<void> {
  // Ensure store is loaded
  await fileBasedStoreService.init()

  ipcMain.handle(CHANNELS.FILE_BASED_STORE_GET, async (_event, key: string) => {
    return fileBasedStoreService.get(key)
  })

  ipcMain.handle(
    CHANNELS.FILE_BASED_STORE_SET,
    async (_event, { key, value }: { key: string; value: unknown }) => {
      await fileBasedStoreService.set(key, value)
      return true
    }
  )

  ipcMain.handle(CHANNELS.FILE_BASED_STORE_DELETE, async (_event, key: string) => {
    await fileBasedStoreService.delete(key)
    return true
  })
}

/**
 * Remove IPC handlers for the file-based store.
 */
export function removeFileBasedStoreIPC(): void {
  ipcMain.removeHandler(CHANNELS.FILE_BASED_STORE_GET)
  ipcMain.removeHandler(CHANNELS.FILE_BASED_STORE_SET)
  ipcMain.removeHandler(CHANNELS.FILE_BASED_STORE_DELETE)
}
