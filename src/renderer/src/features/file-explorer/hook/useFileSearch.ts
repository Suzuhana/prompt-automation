import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { NormalizedFileNode } from 'src/common/types/file-tree-types'

interface UseFileSearchParams {
  query: string
  fuzzy: boolean
  entities: { [path: string]: NormalizedFileNode }
}

/**
 * A custom hook that returns the set of node paths that should be displayed based on the search query.
 * - If `fuzzy` is true, uses fuse.js to match node names.
 * - If a directory is matched, all its descendants are included.
 * - If a file is matched, all its ancestors up to the root are included.
 */
export function useFileSearch({ query, fuzzy, entities }: UseFileSearchParams) {
  const allowedNodePaths = useMemo(() => {
    // If there's no query, we allow all nodes by default:
    if (!query.trim()) {
      return new Set(Object.keys(entities))
    }

    // Convert store object to array for searching:
    const allNodesArray = Object.values(entities)

    // Decide how to filter or fuzzy-match:
    let matchedNodes: NormalizedFileNode[] = []

    if (fuzzy) {
      // Fuse-based fuzzy search:
      const fuse = new Fuse(allNodesArray, {
        keys: ['name'],
        threshold: 0.4, // Adjust as necessary for more or less strict matching
        ignoreLocation: true
      })
      matchedNodes = fuse.search(query.trim()).map((res) => res.item)
    } else {
      // Simple "includes" matching:
      const lowerQuery = query.toLowerCase()
      matchedNodes = allNodesArray.filter((node) => node.name.toLowerCase().includes(lowerQuery))
    }

    // The set of node paths we'll display
    const result = new Set<string>()

    // Helper function: recursively add all children of a directory
    function collectDescendants(directoryPath: string) {
      const dirNode = entities[directoryPath]
      if (!dirNode || dirNode.type !== 'directory' || !dirNode.childPaths) return
      result.add(directoryPath)
      for (const childPath of dirNode.childPaths) {
        result.add(childPath)
        const childNode = entities[childPath]
        if (childNode?.type === 'directory') {
          collectDescendants(childPath)
        }
      }
    }

    // Helper function: recursively add ancestors up to the root
    function collectAncestors(nodePath: string) {
      let currentPath = nodePath
      while (true) {
        const currentNode = entities[currentPath]
        if (!currentNode) break
        result.add(currentPath)
        if (!currentNode.parentPath) break
        currentPath = currentNode.parentPath
      }
    }

    // For each matched node:
    for (const node of matchedNodes) {
      if (node.type === 'directory') {
        // Add this directory + all children
        collectDescendants(node.path)
      } else {
        // It's a file; add the file and all ancestors
        collectAncestors(node.path)
      }
    }

    return result
  }, [query, fuzzy, entities])

  return { allowedNodePaths }
}
