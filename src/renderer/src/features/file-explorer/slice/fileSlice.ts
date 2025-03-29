import { FileNode } from 'src/common/types/file-tree-types'
import type { StateCreator } from 'zustand'

export interface FileSlice {
  treeRoot: FileNode | null
  treeNodeMap: { [key: string]: FileNode }
  initializeWithTreeRoot: (fileNode: FileNode) => void
}

export const createFileSlice: StateCreator<FileSlice, [], [], FileSlice> = (set) => ({
  treeRoot: null,
  treeNodeMap: {},
  initializeWithTreeRoot: (fileNode: FileNode) =>
    set(() => {
      const map: { [key: string]: FileNode } = {}
      const traverse = (node: FileNode) => {
        map[node.path] = node
        if (node.type === 'directory') {
          for (const child of node.children) {
            traverse(child)
          }
        }
      }
      traverse(fileNode)
      return {
        treeRoot: fileNode,
        treeNodeMap: map
      }
    })
})
