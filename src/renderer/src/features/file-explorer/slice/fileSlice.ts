import { SelectedFiles } from '@renderer/types/file'
import { FileNode } from 'src/common/types/file-tree-types'
import type { StateCreator } from 'zustand'

export interface FileSlice {
  treeRoot: FileNode | null
  treeNodeMap: { [key: string]: FileNode }
  selectedFiles: SelectedFiles
  initializeWithTreeRoot: (fileNode: FileNode) => void
  setSelectedFiles: (files: SelectedFiles) => void
  handleBulkSelectionChange: (paths: string[], node: FileNode, selected: boolean) => void
}

export const createFileSlice: StateCreator<FileSlice, [], [], FileSlice> = (set) => ({
  treeRoot: null,
  treeNodeMap: {},
  selectedFiles: {},
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
    }),
  setSelectedFiles: (files: SelectedFiles) => set(() => ({ selectedFiles: files })),
  handleBulkSelectionChange: (paths: string[], node: FileNode, selected: boolean) => {
    set((state) => {
      const updated = { ...state.selectedFiles }
      // Update all provided paths
      for (const p of paths) {
        updated[p] = selected
      }

      let current = node.parent
      while (current && current.type === 'directory' && current.children) {
        const allChildrenSelected = current.children.every((child) => updated[child.path] === true)
        const noneChildrenSelected = current.children.every(
          (child) => !updated[child.path] || updated[child.path] === false
        )

        updated[current.path] = allChildrenSelected
          ? true
          : noneChildrenSelected
            ? false
            : 'indeterminate'

        current = current.parent
      }

      return { selectedFiles: updated }
    })
  }
})
