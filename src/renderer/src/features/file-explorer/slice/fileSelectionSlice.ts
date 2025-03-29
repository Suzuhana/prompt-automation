import { SelectedFiles } from '@renderer/types/file'
import { FileNode } from 'src/common/types/file-tree-types'
import { StateCreator } from 'zustand'

export interface FileSelectionSlice {
  selectedFiles: SelectedFiles
  setSelectedFiles: (files: SelectedFiles) => void
  handleBulkSelectionChange: (paths: string[], node: FileNode, selected: boolean) => void
}

export const createFileSelectionSlice: StateCreator<
  FileSelectionSlice,
  [],
  [],
  FileSelectionSlice
> = (set) => ({
  selectedFiles: {},
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
