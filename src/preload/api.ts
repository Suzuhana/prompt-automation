import { ipcRenderer } from 'electron'
import { CHANNELS } from 'src/common/types/channel-names'
import { ClipboardAPI, FileSystemAPI, PromptAPI } from 'src/preload/preload-api.types'
import { CreatePromptRequest } from 'src/common/types/prompt-types'

export const fileSystemAPI: FileSystemAPI = {
  openFileDialog: (options) => ipcRenderer.invoke(CHANNELS.FILE_SYSTEM_OPEN_DIALOG, options),
  watchDirectory: (directory) =>
    ipcRenderer.invoke(CHANNELS.FILE_WATCHER_START_DIRECTORY, directory),
  stopWatchDirectory: (watchId) =>
    ipcRenderer.invoke(CHANNELS.FILE_WATCHER_STOP_DIRECTORY, watchId),
  // this is used for logging purpose only
  subscriptToDirectoryChanged: (callback) => {
    ipcRenderer.on(CHANNELS.FILE_WATCHER_DIRECTORY_CHANGED, (_event, data) => callback(data))
  },
  cancelSubDirectoryChanged: () => {
    ipcRenderer.off(CHANNELS.FILE_WATCHER_DIRECTORY_CHANGED, () => {})
  },
  getNormalizedDirectoryStructure: (dirPath) =>
    ipcRenderer.invoke(CHANNELS.FILE_SYSTEM_GET_NORMALIZED_DIRECTORY_STRUCTURE, dirPath),
  subscriptToNormalizedDirectoryChanged: (callback) => {
    ipcRenderer.on(CHANNELS.NORMALIZED_DIRECTORY_CHANGED, (_event, data) => callback(data))
  },
  cancelSubNormalizedDirectoryChanged: () => {
    ipcRenderer.off(CHANNELS.NORMALIZED_DIRECTORY_CHANGED, () => {})
  },
  readFileContents: (filePaths) =>
    ipcRenderer.invoke(CHANNELS.FILE_SYSTEM_READ_FILE_CONTENTS, filePaths)
}

export const promptAPI: PromptAPI = {
  createPrompt: (request: CreatePromptRequest) =>
    ipcRenderer.invoke(CHANNELS.PROMPT_CREATE, request)
}

export const clipboardAPI: ClipboardAPI = {
  sendToClipboard: (text: string) => ipcRenderer.invoke(CHANNELS.CLIPBOARD_SEND, text)
}

export const api = {
  fileSystem: fileSystemAPI,
  prompt: promptAPI,
  clipboard: clipboardAPI
}
