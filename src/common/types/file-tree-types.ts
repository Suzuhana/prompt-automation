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

/**
 * Normalized version of a node.
 * Instead of storing nested children, we only keep a list of child paths (for directories)
 * and store `parentPath` as a string reference instead of a FileNode reference.
 */
export interface NormalizedFileNode {
  path: string
  name: string
  type: 'file' | 'directory'
  /**
   * For file nodes
   */
  isBinary?: boolean
  /**
   * For a directory node, childPaths is an array of the children’s `path`.
   */
  childPaths?: string[]
  /**
   * Reference to the parent node's path
   */
  parentPath?: string
}

/**
 * Type representing the complete normalized directory structure.
 */
export interface NormalizedDirectoryStructure {
  root: string
  map: { [path: string]: NormalizedFileNode }
}
