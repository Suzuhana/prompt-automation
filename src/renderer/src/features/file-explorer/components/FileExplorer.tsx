import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@renderer/components/ui/input'
import { toast } from 'sonner'
import { NormalizedFileNode } from 'src/common/types/file-tree-types'
import { FileTree } from './FileTree'
import { useFileDialog } from '../hook/useFileDialog'
import { useAppStore } from '@renderer/store'
import { useFileSearch } from '../hook/useFileSearch'
import { Search, X } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/components/ui/tooltip'
import { estimateTextTokens } from 'src/common/utils/token-estimator'
import { formatTokenSize } from '@renderer/features/file-selection-preview/utils/formatTokenSize'

export function FileExplorer() {
  const { rootPath, isLoading, openFileDialog } = useFileDialog()
  const entities = useAppStore((state) => state.entities)
  const instructions = useAppStore((state) => state.instructions)
  const expansions = useAppStore((state) => state.expansions)
  const bulkSetExpansions = useAppStore((state) => state.bulkSetExpansions)

  const [searchQuery, setSearchQuery] = useState('')
  const [fuzzySearch, setFuzzySearch] = useState(false)

  // Preserve pre-search expansion states for when the query is cleared.
  const previousExpansionsRef = useRef<{ [path: string]: boolean } | null>(null)

  // Get the set of allowed (visible) node paths for the current search.
  const { allowedNodePaths } = useFileSearch({
    query: searchQuery,
    fuzzy: fuzzySearch,
    entities
  })

  const selectedCount = Object.values(entities).filter((node) => node.selected === true).length

  // Track the previous search query to detect changes and update expansion states accordingly.
  const prevSearchRef = useRef<string>('')

  useEffect(() => {
    const prevQuery = prevSearchRef.current
    const currentQuery = searchQuery.trim()
    prevSearchRef.current = currentQuery

    const wasEmpty = !prevQuery
    const isEmpty = !currentQuery

    if (wasEmpty && !isEmpty) {
      // Starting a new search: store previous expansion state.
      previousExpansionsRef.current = expansions
      const newExpansions = computeSearchExpansions(allowedNodePaths, entities)
      if (!shallowEqual(newExpansions, expansions)) {
        bulkSetExpansions(newExpansions)
      }
    } else if (!wasEmpty && !isEmpty) {
      // Updating an ongoing search: recompute the expansion state.
      const newExpansions = computeSearchExpansions(allowedNodePaths, entities)
      if (!shallowEqual(newExpansions, expansions)) {
        bulkSetExpansions(newExpansions)
      }
    } else if (isEmpty && !wasEmpty) {
      // Clearing search: restore previous expansion state.
      const oldExpansions = previousExpansionsRef.current
      if (oldExpansions && !shallowEqual(oldExpansions, expansions)) {
        bulkSetExpansions(oldExpansions)
      }
      previousExpansionsRef.current = null
    }
  }, [searchQuery, allowedNodePaths, entities, expansions, bulkSetExpansions])

  const handlePromptGeneration = useCallback(() => {
    const selectedPaths = Object.values(entities)
      .filter((node) => node.selected === true && node.type === 'file')
      .map((node) => node.path)

    window.api.prompt
      .createPrompt({
        selectedFilePaths: selectedPaths,
        userInstruction: instructions.trim()
      })
      .then((prompt) => {
        const estimatedTokens = estimateTextTokens(prompt)
        window.api.clipboard
          .sendToClipboard(prompt)
          .then(() => {
            toast(
              `Prompt generated with approximately ${formatTokenSize(estimatedTokens)} tokens and copied to clipboard`,
              { action: { label: 'DISMISS', onClick: () => {} } }
            )
          })
          .catch((err) => {
            console.error('Error sending prompt to clipboard:', err)
          })
      })
      .catch((err) => {
        console.error('Error generating prompt:', err)
      })
  }, [entities, instructions])

  return (
    <div className="flex flex-col h-full w-full p-4 gap-1">
      {/* Directory selection row */}
      <div className="flex space-x-4 items-center">
        <Button onClick={() => openFileDialog('directory')} disabled={isLoading} variant="default">
          Select Directory
        </Button>
      </div>

      {/* Search input row */}
      <div className="flex space-x-4 items-center">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={16}
          />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-28 py-1 rounded text-sm w-full" // Increased right padding for buttons container
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-0.5 top-1/2 transform -translate-y-1/2 flex items-center">
            {searchQuery.trim().length > 0 && (
              <Button variant="ghost" onClick={() => setSearchQuery('')} size={'sm'}>
                <X size={8} className="text-gray-500" />
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size={'sm'}
                    pressed={fuzzySearch}
                    onClick={() => setFuzzySearch((prev) => !prev)}
                  >
                    F
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle fuzzy search</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center flex-grow">
          <p>Loading...</p>
        </div>
      )}

      {/* File tree view */}
      {rootPath && !isLoading && (
        <ScrollArea className="flex-grow min-h-0 border rounded-md bg-gray-50/30 dark:bg-gray-800/20">
          <div className="p-4">
            <FileTree
              nodePath={rootPath}
              allowedNodePaths={allowedNodePaths}
              hasActiveSearch={searchQuery.trim().length > 0}
            />
          </div>
        </ScrollArea>
      )}

      {/* Action button for prompt generation */}
      {rootPath && !isLoading && selectedCount > 0 && (
        <div className="mt-auto flex justify-end">
          <Button onClick={handlePromptGeneration}>Prompt Generation ({selectedCount})</Button>
        </div>
      )}
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
