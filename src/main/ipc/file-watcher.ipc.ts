// main/ipc/file-watcher.ipc.ts
import { ipcMain } from 'electron'
import { FileWatcherService } from '../services/file-watcher.service'
import normalizedFileMapService from '../services/normalized-file-map.service'

/**
 * Initialize IPC handlers for file watching.
 */
export function initFileWatcherIPC(): void {
  // Start watching a directory.
  ipcMain.handle('start-watch-directory', async (event, directory: string) => {
    try {
      // Build the initial normalized map.
      await normalizedFileMapService.buildNormalizedMap(directory)
      // Start the watcher; on events update the normalized map.
      const watchId = await FileWatcherService.watchDirectory(directory, async (events) => {
        event.sender.send('directory-changed', { watchId, events }) // this is just for logging
        await normalizedFileMapService.updateMapForEvents(events)
        // Note: the normalized service itself notifies the renderer (debounced)
      })
      return watchId
    } catch (error) {
      console.error('Error in start-watch-directory handler:', error)
      throw error
    }
  })

  // Stop watching a directory.
  ipcMain.handle('stop-watch-directory', async (_, watchId: string) => {
    try {
      await FileWatcherService.unwatchDirectory(watchId)
      return true
    } catch (error) {
      console.error('Error in stop-watch-directory handler:', error)
      throw error
    }
  })
}

/**
 * Remove the file watcher IPC handlers.
 */
export function removeFileWatcherIPC(): void {
  FileWatcherService.removeAllWatchers()
  ipcMain.removeHandler('start-watch-directory')
  ipcMain.removeHandler('stop-watch-directory')
}
