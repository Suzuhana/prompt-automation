import React, { useState } from 'react'
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { FileNode, SelectedFiles } from '@/types/file'

interface FileTreeProps {
  node: FileNode
  selectedFiles: SelectedFiles
  onSelectionChange: (path: string, selected: boolean) => void
  level: number
}

export function FileTree({ node, selectedFiles, onSelectionChange, level }: FileTreeProps) {
  const [expanded, setExpanded] = useState(level < 2) // Auto-expand first two levels

  const isSelected = selectedFiles[node.path] || false

  // Toggle expansion state for directories
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (node.type === 'directory') {
      setExpanded(!expanded)
    }
  }

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    onSelectionChange(node.path, checked)

    // If it's a directory, propagate selection to all children
    if (node.type === 'directory' && node.children) {
      propagateSelection(node, checked)
    }
  }

  // Propagate selection to all children
  const propagateSelection = (current: FileNode, selected: boolean) => {
    if (current.children) {
      current.children.forEach((child) => {
        onSelectionChange(child.path, selected)
        if (child.type === 'directory') {
          propagateSelection(child, selected)
        }
      })
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
            <span className="mr-1 w-4"></span> // Empty space for alignment
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
              onSelectionChange={onSelectionChange}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
