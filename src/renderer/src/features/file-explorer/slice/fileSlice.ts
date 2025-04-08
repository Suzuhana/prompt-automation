import { NormalizedFileNode } from 'src/common/types/file-tree-types'
import type { StateCreator } from 'zustand'
import { CheckedState } from '@radix-ui/react-checkbox'
import { CheckedNormalizedFileNode } from './type'

export interface FileSlice {
  rootPath: string | null
  entities: { [path: string]: CheckedNormalizedFileNode }
  initializeWithTreeRoot: (root: string, map: { [path: string]: NormalizedFileNode }) => void
  handleCheckboxChange: (nodePath: string, selected: boolean) => void
}

export const createFileSlice: StateCreator<FileSlice, [], [], FileSlice> = (set) => ({
  rootPath: null,
  entities: {},

  /**
   * Modified to merge existing selection states, rather than overwrite everything.
   * Newly added nodes default to `false`.
   * After merging, we recursively recalc directory selection states from children.
   */
  initializeWithTreeRoot: (root: string, map: { [path: string]: NormalizedFileNode }) => {
    set((state) => {
      const oldEntities = state.entities
      const newEntities: { [path: string]: CheckedNormalizedFileNode } = {}

      // Build the new entities map, preserving old selection where possible
      for (const path in map) {
        const oldNode = oldEntities[path]
        const selected = oldNode ? oldNode.selected : false // default false for newly added
        newEntities[path] = { ...map[path], selected }
      }

      // Sort childPaths for directory nodes:
      // Directories come before files and, within each type, they are sorted alphabetically.
      Object.keys(newEntities).forEach((path) => {
        const node = newEntities[path]
        if (node.type === 'directory' && node.childPaths && node.childPaths.length > 0) {
          node.childPaths.sort((a, b) => {
            const nodeA = newEntities[a]
            const nodeB = newEntities[b]
            if (nodeA && nodeB) {
              // Directories should come before files.
              if (nodeA.type !== nodeB.type) {
                return nodeA.type === 'directory' ? -1 : 1
              }
              // If same type, sort alphabetically by name.
              return nodeA.name.localeCompare(nodeB.name)
            }
            return 0
          })
        }
      })

      // Recompute selection states for directories from bottom to top
      if (root && newEntities[root]) {
        recalcDirectorySelection(root, newEntities)
      }

      return {
        rootPath: root,
        entities: newEntities
      }
    })
  },

  handleCheckboxChange: (nodePath: string, selected: boolean) => {
    set((state) => {
      const entities = { ...state.entities }
      const node = entities[nodePath]
      if (!node) return state

      if (node.type === 'directory') {
        // For directories, toggle true/false (indeterminate is handled by children).
        const newChecked = node.selected === true ? false : true
        entities[nodePath] = { ...node, selected: newChecked }
        updateDescendants(entities, nodePath, newChecked)
      } else {
        // For files, simply set the boolean checked state
        entities[nodePath] = { ...node, selected }
      }

      updateAncestors(entities, node.parentPath)
      return { entities }
    })
  }
})

/**
 * Recursively calculates the correct directory selection state based on its children.
 * - If all children are true → directory is `true`
 * - If all children are false → directory is `false`
 * - Otherwise → directory is `'indeterminate'`
 */
function recalcDirectorySelection(
  nodePath: string,
  entities: { [path: string]: CheckedNormalizedFileNode }
): CheckedState {
  const node = entities[nodePath]
  if (!node) return false

  if (node.type === 'file') {
    return node.selected
  }

  if (!node.childPaths || node.childPaths.length === 0) {
    // No children: keep whatever state is set (or default to false).
    return node.selected
  }

  let foundTrue = false
  let foundFalse = false

  for (const childPath of node.childPaths) {
    const childState = recalcDirectorySelection(childPath, entities)
    if (childState === true) {
      foundTrue = true
    } else if (childState === false) {
      foundFalse = true
    } else {
      // childState === 'indeterminate'
      foundTrue = true
      foundFalse = true
    }
  }

  let newSelection: CheckedState = 'indeterminate'
  if (foundTrue && !foundFalse) newSelection = true
  else if (!foundTrue && foundFalse) newSelection = false

  // Update this directory’s selection
  node.selected = newSelection
  return newSelection
}

/**
 * For toggling descendants when a directory changes state.
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
 * For updating ancestors after an individual node changes state.
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
