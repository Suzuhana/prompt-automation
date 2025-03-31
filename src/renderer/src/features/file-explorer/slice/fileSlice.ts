import { NormalizedFileNode } from 'src/common/types/file-tree-types'
import type { StateCreator } from 'zustand'
import { CheckedState } from '@radix-ui/react-checkbox'
import { CheckedNormalizedFileNode } from './type'

/**
 * FileSlice is now responsible for the normalized file tree.
 */
export interface FileSlice {
  // The “entry point” for our normalized tree
  rootPath: string | null
  // The normalized node collection, keyed by path, using the refactored type
  entities: { [path: string]: CheckedNormalizedFileNode }
  initializeWithTreeRoot: (root: string, map: { [path: string]: NormalizedFileNode }) => void
  /**
   * Update selection state for a node (and update descendants/ancestors accordingly)
   */
  handleCheckboxChange: (nodePath: string, selected: boolean) => void
}

export const createFileSlice: StateCreator<FileSlice, [], [], FileSlice> = (set) => ({
  rootPath: null,
  entities: {},

  initializeWithTreeRoot: (root: string, map: { [path: string]: NormalizedFileNode }) => {
    // Initialize each node with a default selected state (false)
    const updatedMap = Object.keys(map).reduce(
      (acc, key) => {
        const node = map[key]
        acc[key] = { ...node, selected: false } as CheckedNormalizedFileNode
        return acc
      },
      {} as { [path: string]: CheckedNormalizedFileNode }
    )

    set({
      rootPath: root,
      entities: updatedMap
    })
  },

  handleCheckboxChange: (nodePath: string, selected: boolean) => {
    set((state) => {
      const entities = { ...state.entities }
      const node = entities[nodePath]
      if (!node) return state

      if (node.type === 'directory') {
        // For directories, if current state is true then toggle to false;
        // otherwise (false or 'indeterminate') set to true.
        const newChecked = node.selected === true ? false : true
        entities[nodePath] = { ...node, selected: newChecked }
        // Propagate new state downwards to all descendants.
        updateDescendants(entities, nodePath, newChecked)
      } else {
        // For file nodes, simply update its checked state.
        entities[nodePath] = { ...node, selected }
      }

      // Update the ancestors based on the updated children state.
      updateAncestors(entities, node.parentPath)
      return { entities }
    })
  }
})

/**
 * Recursively updates the selected state for all descendant nodes.
 */
function updateDescendants(
  entities: { [path: string]: CheckedNormalizedFileNode },
  nodePath: string,
  selected: boolean
) {
  const node = entities[nodePath]
  if (!node || node.type !== 'directory' || !node.childPaths) return

  node.childPaths.forEach((childPath) => {
    const child = entities[childPath]
    if (child) {
      entities[childPath] = { ...child, selected }
      if (child.type === 'directory') {
        updateDescendants(entities, childPath, selected)
      }
    }
  })
}

/**
 * Recursively updates the selected state for ancestor nodes based on their children's states.
 */
function updateAncestors(
  entities: { [path: string]: CheckedNormalizedFileNode },
  parentPath?: string
) {
  if (!parentPath) return

  const parent = entities[parentPath]
  if (!parent || parent.type !== 'directory' || !parent.childPaths) return

  let allTrue = true
  let allFalse = true

  parent.childPaths.forEach((childPath) => {
    const child = entities[childPath]
    if (child) {
      if (child.selected !== true) {
        allTrue = false
      }
      if (child.selected !== false) {
        allFalse = false
      }
    }
  })

  const newSelected: CheckedState = allTrue ? true : allFalse ? false : 'indeterminate'
  entities[parentPath] = { ...parent, selected: newSelected }
  updateAncestors(entities, parent.parentPath)
}
