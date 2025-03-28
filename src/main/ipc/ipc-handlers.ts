import { initFileSystemIPC, removeFileSystemIPC } from './file-system.ipc'
import { initFileWatcherIPC, removeFileWatcherIPC } from './file-watcher.ipc'

/**
 * Register all IPC handlers for the main process
 */
export function setupIpcHandlers(): void {
  initFileSystemIPC()
  initFileWatcherIPC()
}

/**
 * Unregister all IPC handlers when the app is shutting down
 */
export function removeIpcHandlers(): void {
  // Remove file system IPC
  removeFileSystemIPC()
  removeFileWatcherIPC()
}
