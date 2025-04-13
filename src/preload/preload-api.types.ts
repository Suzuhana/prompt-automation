import { NormalizedDirectoryStructure } from '../common/types/file-tree-types'
import { DirectoryChangedData } from '../common/types/file-watcher-types'
import { CreatePromptRequest } from '../common/types/prompt-types'

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
  readFileContents: (filePaths: string[]) => Promise<Record<string, string>>
}

export interface PromptAPI {
  createPrompt: (request: CreatePromptRequest) => Promise<string>
}
