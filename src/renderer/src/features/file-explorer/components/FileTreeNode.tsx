import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { ExpansionIndicator } from './ExpansionIndicator'
import { FileTypeIcon } from './FileTypeIcon'
import { FileNode } from 'src/common/types/file'

interface FileTreeNodeProps {
  node: FileNode
  level: number
  isSelected: boolean
  isExpanded: boolean
  onToggleExpand: (event: React.MouseEvent) => void
  onCheckboxChange: (checked: boolean) => void
}

export function FileTreeNode({
  node,
  level,
  isSelected,
  isExpanded,
  onToggleExpand,
  onCheckboxChange
}: FileTreeNodeProps) {
  // Indentation based on level
  const indentStyle = {
    paddingLeft: `${level * 20}px`
  }

  // Prevent checkbox click from triggering the main node click logic below
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // New handler for the main node click based on node type
  const handleNodeClick = (event: React.MouseEvent) => {
    event.stopPropagation() // Prevent bubbling up if nested
    if (node.type === 'directory') {
      // For directories, toggle expansion
      onToggleExpand(event)
    } else if (node.type === 'file') {
      // For files, simulate clicking the checkbox (toggle its state)
      onCheckboxChange(!isSelected)
    }
  }

  return (
    <div
      className="flex items-center py-1 hover:bg-gray-50 rounded cursor-pointer group"
      // Use the new conditional click handler
      onClick={handleNodeClick}
      style={indentStyle}
      role="treeitem"
      aria-expanded={node.type === 'directory' ? isExpanded : undefined}
      aria-selected={isSelected}
    >
      <ExpansionIndicator isExpanded={isExpanded} isVisible={node.type === 'directory'} />

      <Checkbox
        id={`checkbox-${node.path}`} // Add id for label association if needed
        checked={isSelected}
        // The checkbox component handles its state change via onCheckedChange
        onCheckedChange={onCheckboxChange}
        // Still stop propagation when clicking the checkbox directly
        onClick={handleCheckboxClick}
        className="mr-2"
        aria-label={`Select ${node.name}`}
      />

      <FileTypeIcon type={node.type} />

      <span className="text-sm truncate group-hover:text-clip">{node.name}</span>
    </div>
  )
}
