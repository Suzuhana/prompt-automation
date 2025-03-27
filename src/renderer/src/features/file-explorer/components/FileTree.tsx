import React, { useState, useCallback } from 'react'
import type { SelectedFiles } from '@/types/file'
import { FileTreeNode } from './FileTreeNode'
import { FileNode } from 'src/common/types/file'

interface FileTreeProps {
  node: FileNode
  selectedFiles: SelectedFiles
  /**
   * Handles bulk selection of paths.
   * @param paths Array of file/directory paths to select or deselect
   * @param selected Whether to select or deselect all given paths
   */
  onBulkSelectionChange: (paths: string[], selected: boolean) => void
  level?: number // Make level optional, default to 0
}

/**
 * Recursively gather all paths under a node (including its own).
 */
function gatherAllPaths(node: FileNode): string[] {
  const paths: string[] = [node.path] // Start with the node itself

  function recurse(n: FileNode) {
    if (n.type === 'directory' && n.children) {
      n.children.forEach((child) => {
        paths.push(child.path)
        recurse(child)
      })
    }
  }

  recurse(node)
  return paths
}

export function FileTree({
  node,
  selectedFiles,
  onBulkSelectionChange,
  level = 0 // Default level to 0
}: FileTreeProps) {
  // State for expansion, default based on level
  const [isExpanded, setIsExpanded] = useState(level < 1) // Auto-expand only the root level initially

  // Determine if the current node is selected
  const isSelected = selectedFiles[node.path] || false

  // Memoized toggle expansion handler
  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent event bubbling
      if (node.type === 'directory') {
        setIsExpanded((prev) => !prev)
      }
    },
    [node.type]
  )

  // Memoized checkbox change handler
  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      const pathsToUpdate = gatherAllPaths(node)
      onBulkSelectionChange(pathsToUpdate, checked)
    },
    [node, onBulkSelectionChange]
  )

  return (
    <div role="tree" aria-label="File navigator">
      <FileTreeNode
        node={node}
        level={level}
        isSelected={isSelected}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        onCheckboxChange={handleCheckboxChange}
      />

      {/* Render children if expanded and node is a directory */}
      {isExpanded && node.type === 'directory' && node.children && node.children.length > 0 && (
        <div role="group">
          {node.children.map((child) => (
            <FileTree // Recursive call for children
              key={child.path} // Use path as key
              node={child}
              selectedFiles={selectedFiles}
              onBulkSelectionChange={onBulkSelectionChange}
              level={level + 1} // Increment level for children
            />
          ))}
        </div>
      )}
    </div>
  )
}
