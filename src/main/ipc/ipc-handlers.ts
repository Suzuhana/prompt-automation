import { initFileSystemIPC, removeFileSystemIPC } from './file-system.ipc'

/**
 * Register all IPC handlers for the main process
 */
export function setupIpcHandlers(): void {
  // Initialize file system IPC
  initFileSystemIPC()

  // Register other feature handlers here if needed
  // initOtherFeatureIPC();
}

/**
 * Unregister all IPC handlers when the app is shutting down
 */
export function removeIpcHandlers(): void {
  // Remove file system IPC
  removeFileSystemIPC()

  // Remove other feature handlers here if needed
  // removeOtherFeatureIPC();
}
