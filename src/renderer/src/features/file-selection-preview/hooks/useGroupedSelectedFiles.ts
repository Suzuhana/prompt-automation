import { useMemo } from 'react'
import { useAppStore } from '@renderer/store'

export interface PreviewFile {
  path: string
  name: string
  tokenSize: number
}

// Helper function to normalize paths (replace backslashes with forward slashes)
const normalizePath = (path: string): string => path.replace(/\\/g, '/')

export function useGroupedSelectedFiles(): Record<string, PreviewFile[]> {
  const entities = useAppStore((state) => state.entities)
  const rootPath = useAppStore((state) => state.rootPath)
  const normalizedRoot = rootPath ? normalizePath(rootPath) : ''

  return useMemo(() => {
    // Extract selected file nodes (only files) from the fileSlice store.
    const selectedFiles = Object.values(entities).filter(
      (node) => node.type === 'file' && node.selected === true
    )

    // Group the selected files by their parent directory,
    // trimming the normalizedRoot prefix if present.
    return selectedFiles.reduce<Record<string, PreviewFile[]>>((groups, node) => {
      let rawParent = node.parentPath || normalizedRoot || 'Root'
      rawParent = normalizePath(rawParent)

      if (normalizedRoot && rawParent.startsWith(normalizedRoot)) {
        rawParent = rawParent.slice(normalizedRoot.length)
        if (rawParent.startsWith('/')) {
          rawParent = rawParent.slice(1)
        }
        if (rawParent === '') {
          rawParent = '.'
        }
      }

      if (!groups[rawParent]) {
        groups[rawParent] = []
      }

      groups[rawParent].push({
        path: node.path,
        name: node.name,
        tokenSize: node.tokenCount || 0
      })

      return groups
    }, {})
  }, [entities, normalizedRoot])
}
