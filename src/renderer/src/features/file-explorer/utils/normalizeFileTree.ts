import { FileNode, FileNodeFile, FileNodeDirectory } from 'src/common/types/file-tree-types'
import { CheckedState } from '@radix-ui/react-checkbox'

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
   * Reference to the parent node's path (instead of the full node).
   */
  parentPath?: string
  /**
   * Selection status: true, false, or "indeterminate"
   */
  selected: CheckedState
}

/**
 * The result of normalizing a file tree.
 * `rootPath` can be used as the entry point to the file tree
 * `entities` is a path => NormalizedFileNode map
 */
export interface NormalizedTree {
  rootPath: string
  entities: Record<string, NormalizedFileNode>
}

/**
 * Recursively traverse the nested FileNode and build the normalized map.
 */
export function normalizeFileTree(root: FileNode): NormalizedTree {
  const entities: Record<string, NormalizedFileNode> = {}

  function traverse(node: FileNode, parentPath?: string) {
    if (node.type === 'file') {
      const fileNode = node as FileNodeFile
      entities[node.path] = {
        path: fileNode.path,
        name: fileNode.name,
        type: 'file',
        isBinary: fileNode.isBinary,
        parentPath,
        selected: false
      }
    } else {
      const dirNode = node as FileNodeDirectory
      entities[node.path] = {
        path: dirNode.path,
        name: dirNode.name,
        type: 'directory',
        childPaths: dirNode.children.map((child) => child.path),
        parentPath,
        selected: false
      }
      // Recurse into children
      for (const child of dirNode.children) {
        traverse(child, dirNode.path)
      }
    }
  }

  traverse(root, undefined)

  return {
    rootPath: root.path,
    entities
  }
}
