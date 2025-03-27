/**
 * Interface representing a file or directory node in the tree structure
 */
export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}
