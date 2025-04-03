// src/common/types/preload-api.types.ts
import { NormalizedDirectoryStructure } from '../common/types/file-tree-types'
import { DirectoryChangedData } from '../common/types/file-watcher-types'

// Interface for FileSystemAPI
export interface FileSystemAPI {
  openFileDialog: (options: Electron.OpenDialogOptions) => Promise<string | null>
  watchDirectory: (directory: string) => Promise<string>
  stopWatchDirectory: (watchId: string) => Promise<boolean>
  subscriptToDirectoryChanged: (callback: (data: DirectoryChangedData) => void) => void
  cancelSubDirectoryChanged: () => void
  getNormalizedDirectoryStructure: (dirPath: string) => Promise<NormalizedDirectoryStructure>
  subscriptToNormalizedDirectoryChanged: (
    callback: (data: NormalizedDirectoryStructure) => void
  ) => void
  cancelSubNormalizedDirectoryChanged: () => void
}

// Optionally, if you have more “groups” of APIs later (like authAPI, settingsAPI),
// define them here too and export a single “API” interface that merges them.
