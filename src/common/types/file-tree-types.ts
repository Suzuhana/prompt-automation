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
  /**
   * Optional reference to the parent node (helps navigate upward in the tree)
   */
  parent?: FileNode
}

export interface FileNodeDirectory extends BaseNode {
  type: 'directory'
  // Make children mandatory, so it's never `undefined`
  children: FileNode[]
  /**
   * Optional reference to the parent node (helps navigate upward in the tree)
   */
  parent?: FileNode
}

export type FileNode = FileNodeFile | FileNodeDirectory
