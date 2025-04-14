import { initFileSystemIPC, removeFileSystemIPC } from './file-system.ipc'
import { initFileWatcherIPC, removeFileWatcherIPC } from './file-watcher.ipc'
import { initPromptIPC, removePromptIPC } from './prompt.ipc'
import { initClipboardIPC, removeClipboardIPC } from './clipboard.ipc'
import { initFileBasedStoreIPC, removeFileBasedStoreIPC } from './file-based-store.ipc'

/**
 * Register all IPC handlers for the main process
 */
export function setupIpcHandlers(): void {
  initFileSystemIPC()
  initFileWatcherIPC()
  initPromptIPC()
  initClipboardIPC()
  initFileBasedStoreIPC()
}

/**
 * Unregister all IPC handlers when the app is shutting down
 */
export function removeIpcHandlers(): void {
  // Remove file system IPC
  removeFileSystemIPC()
  removeFileWatcherIPC()
  removePromptIPC()
  removeClipboardIPC()
  removeFileBasedStoreIPC()
}
