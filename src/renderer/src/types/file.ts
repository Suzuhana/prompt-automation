// Type definitions for file tree structure

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  selected?: boolean
}

export interface SelectedFiles {
  [path: string]: boolean
}
