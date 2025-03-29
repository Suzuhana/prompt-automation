import { useAppStore } from '@renderer/store'
import { FileNode } from 'src/common/types/file-tree-types'

export function useFileEventHandler() {
  const rootNode = useAppStore((state) => state.treeRoot)
  const nodeMap = useAppStore((state) => state.treeNodeMap)

  function updateFileNode(path: string, newProps: Partial<FileNode>) {
    //TODO
  }
  function addFileNode(parentPath: string, newNode: FileNode) {
    //TODO
  }
  function removeFileNode(nodePath: string) {
    //TODO
  }
  function renameFileNode(oldPath: string, newPath: string) {
    //TODO
  }

  return {
    updateFileNode,
    addFileNode,
    removeFileNode,
    renameFileNode
  }
}
