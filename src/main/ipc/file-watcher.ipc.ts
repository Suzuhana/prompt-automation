// main/ipc/file-watcher.ipc.ts
import { ipcMain } from 'electron'
import { FileWatcherService } from '../services/file-watcher.service'
import normalizedFileMapService from '../services/normalized-file-map.service'
import { CHANNELS } from 'src/common/types/channel-names'

/**
 * Initialize IPC handlers for file watching.
 */
export function initFileWatcherIPC(): void {
  // Start watching a directory.
  ipcMain.handle(CHANNELS.FILE_WATCHER_START_DIRECTORY, async (event, directory: string) => {
    try {
      // Build the initial normalized map.
      await normalizedFileMapService.buildNormalizedMap(directory)
      // Start the watcher; on events update the normalized map.
      const watchId = await FileWatcherService.watchDirectory(directory, async (events) => {
        event.sender.send(CHANNELS.FILE_WATCHER_DIRECTORY_CHANGED, { watchId, events }) // this is just for logging
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
  ipcMain.handle(CHANNELS.FILE_WATCHER_STOP_DIRECTORY, async (_, watchId: string) => {
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
  ipcMain.removeHandler(CHANNELS.FILE_WATCHER_START_DIRECTORY)
  ipcMain.removeHandler(CHANNELS.FILE_WATCHER_STOP_DIRECTORY)
}
