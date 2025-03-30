import React, { useState, useCallback } from 'react'
import { FileTreeNode } from './FileTreeNode'
import { useAppStore } from '@renderer/store'

interface FileTreeProps {
  nodePath: string
  level?: number
}

export function FileTree({ nodePath, level = 0 }: FileTreeProps) {
  // Access the node data via store's normalized entities
  const node = useAppStore((state) => state.entities[nodePath])
  const handleCheckboxChange = useAppStore((state) => state.handleCheckboxChange)

  // Local expansion state
  const [isExpanded, setIsExpanded] = useState(level < 1)

  // Use the selection state from the normalized node
  const isSelected = node?.selected ?? false

  // Toggle expand/collapse only if it's a directory
  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (node?.type === 'directory') {
        setIsExpanded((prev) => !prev)
      }
    },
    [node?.type]
  )

  if (!node) {
    // If there's no entity in the store for this path, render nothing
    return null
  }

  return (
    <div role="tree" aria-label="File navigator">
      <FileTreeNode
        nodePath={nodePath}
        level={level}
        isSelected={isSelected}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        onCheckboxChange={(checked) => handleCheckboxChange(nodePath, checked)}
      />

      {isExpanded && node.type === 'directory' && node.childPaths && node.childPaths.length > 0 && (
        <div role="group">
          {node.childPaths.map((childPath) => (
            <FileTree key={childPath} nodePath={childPath} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
