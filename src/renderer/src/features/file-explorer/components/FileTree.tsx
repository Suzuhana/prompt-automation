import React, { useState } from 'react'
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { FileNode, SelectedFiles } from '@/types/file'

interface FileTreeProps {
  node: FileNode
  selectedFiles: SelectedFiles
  /**
   * Updated prop to handle bulk selection of paths.
   * @param paths Array of file/directory paths to select or deselect
   * @param selected Whether to select or deselect all given paths
   */
  onBulkSelectionChange: (paths: string[], selected: boolean) => void
  level: number
}

/**
 * Recursively gather all paths under a node (including its own).
 * This helps us toggle entire directory trees in a single state update.
 */
function gatherAllPaths(node: FileNode): string[] {
  const paths: string[] = []

  function recurse(n: FileNode) {
    paths.push(n.path)
    if (n.type === 'directory' && n.children) {
      n.children.forEach(recurse)
    }
  }

  recurse(node)
  return paths
}

export function FileTree({ node, selectedFiles, onBulkSelectionChange, level }: FileTreeProps) {
  const [expanded, setExpanded] = useState(level < 2) // Auto-expand first two levels
  const isSelected = selectedFiles[node.path] || false

  // Toggle expansion state for directories
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (node.type === 'directory') {
      setExpanded(!expanded)
    }
  }

  // Handle checkbox change in a single call
  const handleCheckboxChange = (checked: boolean) => {
    if (node.type === 'directory') {
      const allPaths = gatherAllPaths(node)
      onBulkSelectionChange(allPaths, checked)
    } else {
      onBulkSelectionChange([node.path], checked)
    }
  }

  // Indentation based on level
  const indentStyle = {
    paddingLeft: `${level * 20}px`
  }

  return (
    <div>
      <div
        className="flex items-center py-1 hover:bg-gray-50 rounded cursor-pointer"
        onClick={toggleExpand}
        style={indentStyle}
      >
        <div className="flex items-center">
          {node.type === 'directory' ? (
            <span className="mr-1 text-gray-500">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          ) : (
            <span className="mr-1 w-4" />
          )}

          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="mr-2"
          />

          {node.type === 'directory' ? (
            <Folder size={16} className="mr-2 text-blue-500" />
          ) : (
            <File size={16} className="mr-2 text-gray-500" />
          )}

          <span className="text-sm">{node.name}</span>
        </div>
      </div>

      {/* Render children if expanded and node is a directory */}
      {expanded && node.type === 'directory' && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTree
              key={`${child.path}-${index}`}
              node={child}
              selectedFiles={selectedFiles}
              onBulkSelectionChange={onBulkSelectionChange}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
