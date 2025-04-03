import { ipcRenderer } from 'electron'
import { FileSystemAPI } from 'src/preload/preload-api.types'

export const fileSystemAPI: FileSystemAPI = {
  openFileDialog: (options) => ipcRenderer.invoke('file-system:open-file-dialog', options),
  watchDirectory: (directory) =>
    ipcRenderer.invoke('file-watcher:start-watch-directory', directory),
  stopWatchDirectory: (watchId) => ipcRenderer.invoke('file-watcher:stop-watch-directory', watchId),
  subscriptToDirectoryChanged: (callback) => {
    ipcRenderer.on('file-watcher:directory-changed', (_event, data) => callback(data))
  },
  cancelSubDirectoryChanged: () => {
    ipcRenderer.off('file-watcher:directory-changed', () => {})
  },
  getNormalizedDirectoryStructure: (dirPath) =>
    ipcRenderer.invoke('file-system:get-normalized-directory-structure', dirPath),
  subscriptToNormalizedDirectoryChanged: (callback) => {
    ipcRenderer.on('normalized-directory-changed', (_event, data) => callback(data))
  },
  cancelSubNormalizedDirectoryChanged: () => {
    ipcRenderer.off('normalized-directory-changed', () => {})
  }
}
