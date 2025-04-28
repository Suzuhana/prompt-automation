import { useState, useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFileDialog } from '../hook/useFileDialog'
import { useAppStore } from '@renderer/store'
import { useFileSearch } from '../hook/useFileSearch'
import { FileTree } from './FileTree'
import { DirectorySelector } from './DirectorySelector'
import { SearchBar } from './SearchBar'
import { PromptAction } from './PromptAction'
import { NormalizedFileNode } from 'src/common/types/file-tree-types'

export function FileExplorer() {
  const { rootPath, isLoading, openFileDialog, loadWithPath } = useFileDialog()
  const entities = useAppStore((state) => state.entities)
  const instructions = useAppStore((state) => state.instructions)
  const expansions = useAppStore((state) => state.expansions)
  const bulkSetExpansions = useAppStore((state) => state.bulkSetExpansions)

  const [searchQuery, setSearchQuery] = useState('')
  const [fuzzySearch, setFuzzySearch] = useState(false)
  const previousExpansionsRef = useRef<Record<string, boolean> | null>(null)
  const prevSearchRef = useRef<string>('')

  const { allowedNodePaths } = useFileSearch({
    query: searchQuery,
    fuzzy: fuzzySearch,
    entities
  })

  useEffect(() => {
    const prevQuery = prevSearchRef.current
    const currentQuery = searchQuery.trim()
    prevSearchRef.current = currentQuery

    if (!prevQuery && currentQuery) {
      previousExpansionsRef.current = expansions
      const newExpansions = computeSearchExpansions(allowedNodePaths, entities)
      if (!shallowEqual(newExpansions, expansions)) bulkSetExpansions(newExpansions)
    } else if (prevQuery && currentQuery) {
      const newExpansions = computeSearchExpansions(allowedNodePaths, entities)
      if (!shallowEqual(newExpansions, expansions)) bulkSetExpansions(newExpansions)
    } else if (!currentQuery && prevQuery) {
      const oldExpansions = previousExpansionsRef.current
      if (oldExpansions && !shallowEqual(oldExpansions, expansions)) {
        bulkSetExpansions(oldExpansions)
      }
      previousExpansionsRef.current = null
    }
  }, [searchQuery, allowedNodePaths, entities, expansions, bulkSetExpansions])

  return (
    <div className="flex flex-col h-full w-full p-2 gap-1">
      <DirectorySelector
        openFileDialog={openFileDialog}
        isLoading={isLoading}
        loadWithPath={loadWithPath}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        fuzzySearch={fuzzySearch}
        onToggleFuzzy={() => setFuzzySearch((prev) => !prev)}
      />

      {isLoading && (
        <div className="flex justify-center items-center flex-grow">
          <p>Loading...</p>
        </div>
      )}

      {rootPath && !isLoading && (
        <ScrollArea className="flex-grow min-h-0 border mb-1 rounded-md bg-gray-50/30 dark:bg-gray-800/20">
          <div className="p-4">
            <FileTree
              nodePath={rootPath}
              allowedNodePaths={allowedNodePaths}
              hasActiveSearch={Boolean(searchQuery.trim())}
            />
          </div>
        </ScrollArea>
      )}

      {rootPath && !isLoading && <PromptAction entities={entities} instructions={instructions} />}
    </div>
  )
}

function computeSearchExpansions(
  matchedNodePaths: Set<string>,
  allEntities: { [path: string]: NormalizedFileNode }
): { [path: string]: boolean } {
  const expansions: { [path: string]: boolean } = {}

  // Initialize all expansion states to false.
  Object.keys(allEntities).forEach((path) => {
    expansions[path] = false
  })

  // Helper function to expand all ancestors of a file node.
  const expandAncestors = (nodePath: string) => {
    let currentPath = nodePath
    while (true) {
      const current = allEntities[currentPath]
      if (!current || !current.parentPath) break
      expansions[current.parentPath] = true
      currentPath = current.parentPath
    }
  }

  matchedNodePaths.forEach((path) => {
    const node = allEntities[path]
    if (node?.type === 'directory') {
      expansions[path] = true
    } else if (node?.type === 'file') {
      expandAncestors(path)
    }
  })

  return expansions
}

function shallowEqual(objA: { [k: string]: boolean }, objB: { [k: string]: boolean }): boolean {
  if (objA === objB) return true
  const aKeys = Object.keys(objA)
  const bKeys = Object.keys(objB)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (objA[key] !== objB[key]) {
      return false
    }
  }
  return true
}
