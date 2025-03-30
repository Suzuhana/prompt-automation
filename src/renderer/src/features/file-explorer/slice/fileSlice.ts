import { FileNode } from 'src/common/types/file-tree-types'
import { NormalizedFileNode, normalizeFileTree } from '../utils/normalizeFileTree'
import type { StateCreator } from 'zustand'
import { CheckedState } from '@radix-ui/react-checkbox'

/**
 * FileSlice is now responsible for the normalized file tree.
 */
export interface FileSlice {
  // The “entry point” for our normalized tree
  rootPath: string | null
  // The normalized node collection, keyed by path
  entities: Record<string, NormalizedFileNode>
  initializeWithTreeRoot: (fileNode: FileNode) => void
  /**
   * Update selection state for a node (and update descendants/ancestors accordingly)
   */
  handleCheckboxChange: (nodePath: string, checked: boolean) => void
}

export const createFileSlice: StateCreator<FileSlice, [], [], FileSlice> = (set) => ({
  rootPath: null,
  entities: {},

  initializeWithTreeRoot: (fileNode: FileNode) => {
    const { rootPath, entities } = normalizeFileTree(fileNode)
    set({
      rootPath,
      entities
    })
  },

  handleCheckboxChange: (nodePath: string, checked: boolean) => {
    set((state) => {
      const newEntities = { ...state.entities }

      // Recursively update the node and its descendants
      const updateDescendants = (path: string, checked: boolean) => {
        const node = newEntities[path]
        if (!node) return
        newEntities[path] = { ...node, selected: checked }
        if (node.type === 'directory' && node.childPaths) {
          for (const childPath of node.childPaths) {
            updateDescendants(childPath, checked)
          }
        }
      }
      updateDescendants(nodePath, checked)

      // Update ancestors based on their children's selection states
      const updateAncestors = (path: string) => {
        const node = newEntities[path]
        if (!node || !node.parentPath) return
        const parent = newEntities[node.parentPath]
        if (!parent || !parent.childPaths) return

        const childrenSelections = parent.childPaths.map(
          (childPath) => newEntities[childPath].selected
        )
        const allSelected = childrenSelections.every((sel) => sel === true)
        const noneSelected = childrenSelections.every((sel) => sel === false)
        const parentSelection: CheckedState = allSelected
          ? true
          : noneSelected
            ? false
            : 'indeterminate'
        newEntities[parent.path] = { ...parent, selected: parentSelection }
        updateAncestors(parent.path)
      }
      updateAncestors(nodePath)

      return { entities: newEntities }
    })
  }
})
