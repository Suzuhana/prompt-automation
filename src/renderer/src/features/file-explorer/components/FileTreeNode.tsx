import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { ExpansionIndicator } from './ExpansionIndicator'
import { FileTypeIcon } from './FileTypeIcon'
import { Badge } from '@renderer/components/ui/badge'
import { CheckedState } from '@radix-ui/react-checkbox'
import { useAppStore } from '@renderer/store'

interface FileTreeNodeProps {
  nodePath: string
  level: number
  isSelected: CheckedState
  isExpanded: boolean
  onCheckboxChange: (checked: boolean) => void
}

export function FileTreeNode({
  nodePath,
  level,
  isSelected,
  isExpanded,
  onCheckboxChange
}: FileTreeNodeProps) {
  const node = useAppStore((state) => state.entities[nodePath])
  const toggleNodeExpansion = useAppStore((state) => state.toggleNodeExpansion)

  if (!node) {
    return null
  }

  const indentStyle = {
    paddingLeft: `${level * 20}px`
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleNodeClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    // For directories: toggle expansion
    if (node.type === 'directory') {
      toggleNodeExpansion(nodePath)
    } else if (node.type === 'file') {
      // For files, toggle the checkbox
      onCheckboxChange(isSelected === 'indeterminate' || isSelected === false ? true : false)
    }
  }

  return (
    <div
      className="flex items-center py-1 hover:bg-gray-50 rounded cursor-pointer group"
      onClick={handleNodeClick}
      style={indentStyle}
      role="treeitem"
      aria-expanded={node.type === 'directory' ? isExpanded : undefined}
      aria-selected={isSelected !== false}
    >
      <ExpansionIndicator isExpanded={isExpanded} isVisible={node.type === 'directory'} />

      <Checkbox
        id={`checkbox-${node.path}`}
        checked={isSelected}
        onCheckedChange={onCheckboxChange}
        onClick={handleCheckboxClick}
        className="mr-2"
        aria-label={`Select ${node.name}`}
      />

      <FileTypeIcon type={node.type} />

      <span className="text-sm truncate group-hover:text-clip">{node.name}</span>

      {node.type === 'file' && node.isBinary && (
        <Badge variant="secondary" className="ml-2 text-xs">
          Binary
        </Badge>
      )}
    </div>
  )
}
