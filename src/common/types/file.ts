/**
 * Interface representing a file or directory node in the tree structure
 */
interface BaseNode {
  name: string
  path: string
}

export interface FileNodeFile extends BaseNode {
  type: 'file'
  isBinary: boolean
}

export interface FileNodeDirectory extends BaseNode {
  type: 'directory'
  children?: FileNode[]
}

export type FileNode = FileNodeFile | FileNodeDirectory
