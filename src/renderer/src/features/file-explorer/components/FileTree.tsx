import React, { useState, useCallback } from 'react'
import type { SelectedFiles } from '@/types/file'
import { FileTreeNode } from './FileTreeNode'
import { FileNode } from 'src/common/types/file-tree-types'
import { useAppStore } from '@renderer/store'

interface FileTreeProps {
  node: FileNode
  selectedFiles: SelectedFiles
  /**
   * Handles bulk selection of paths.
   * @param paths Array of file/directory paths to select or deselect
   * @param node FileNode which triggers this update
   * @param selected Whether to select or deselect all given paths
   */
  level?: number // Make level optional, default to 0
}

export function FileTree({
  node,
  selectedFiles,
  level = 0 // Default level to 0
}: FileTreeProps) {
  const handleCheckboxChange = useAppStore((state) => state.handleCheckboxChange)
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

  return (
    <div role="tree" aria-label="File navigator">
      <FileTreeNode
        node={node}
        level={level}
        isSelected={isSelected}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        onCheckboxChange={(checked) => handleCheckboxChange(node, checked)}
      />

      {/* Render children if expanded and node is a directory */}
      {isExpanded && node.type === 'directory' && node.children && node.children.length > 0 && (
        <div role="group">
          {node.children.map((child) => (
            <FileTree // Recursive call for children
              key={child.path} // Use path as key
              node={child}
              selectedFiles={selectedFiles}
              level={level + 1} // Increment level for children
            />
          ))}
        </div>
      )}
    </div>
  )
}
