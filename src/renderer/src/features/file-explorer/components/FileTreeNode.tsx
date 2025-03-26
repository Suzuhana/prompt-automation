import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import type { FileNode } from '@/types/file'
import { ExpansionIndicator } from './ExpansionIndicator'
import { FileTypeIcon } from './FileTypeIcon'

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

  // Prevent checkbox click from toggling expansion
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="flex items-center py-1 hover:bg-gray-50 rounded cursor-pointer group"
      onClick={onToggleExpand}
      style={indentStyle}
      role="treeitem"
      aria-expanded={node.type === 'directory' ? isExpanded : undefined}
      aria-selected={isSelected}
    >
      <ExpansionIndicator isExpanded={isExpanded} isVisible={node.type === 'directory'} />

      <Checkbox
        id={`checkbox-${node.path}`} // Add id for label association if needed
        checked={isSelected}
        onCheckedChange={onCheckboxChange}
        onClick={handleCheckboxClick}
        className="mr-2"
        aria-label={`Select ${node.name}`}
      />

      <FileTypeIcon type={node.type} />

      <span className="text-sm truncate group-hover:text-clip">{node.name}</span>
    </div>
  )
}
