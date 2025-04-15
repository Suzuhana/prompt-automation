import { FileTreeNode } from './FileTreeNode'
import { useAppStore } from '@renderer/store'

interface FileTreeProps {
  nodePath: string
  level?: number
  allowedNodePaths?: Set<string>
  hasActiveSearch?: boolean
}

export function FileTree({
  nodePath,
  level = 0,
  allowedNodePaths,
  hasActiveSearch
}: FileTreeProps) {
  const node = useAppStore((state) => state.entities[nodePath])
  const expansions = useAppStore((state) => state.expansions)
  const handleCheckboxChange = useAppStore((state) => state.handleCheckboxChange)

  if (!node) {
    return null
  }

  // If allowedNodePaths is given, skip rendering nodes not in it
  if (allowedNodePaths && !allowedNodePaths.has(nodePath)) {
    return null
  }

  // Now we read the expansion state from the store:
  const isExpanded = expansions[nodePath] ?? false
  const isSelected = node.selected ?? false

  return (
    <div role="tree" aria-label="File navigator">
      <FileTreeNode
        nodePath={nodePath}
        level={level}
        isSelected={isSelected}
        isExpanded={isExpanded}
        onCheckboxChange={(checked) => handleCheckboxChange(nodePath, checked)}
      />
      {isExpanded && node.type === 'directory' && node.childPaths && node.childPaths.length > 0 && (
        <div role="group">
          {node.childPaths.map((childPath) => (
            <FileTree
              key={childPath}
              nodePath={childPath}
              level={level + 1}
              allowedNodePaths={allowedNodePaths}
              hasActiveSearch={hasActiveSearch}
            />
          ))}
        </div>
      )}
    </div>
  )
}
