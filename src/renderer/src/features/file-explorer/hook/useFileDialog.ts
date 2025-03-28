import { useState } from 'react'
import type { SelectedFiles } from '@/types/file'
import { OpenDialogOptions } from 'electron'
import { FileNode } from 'src/common/types/file-tree-types'
import { useFileWatcher } from '@renderer/features/file-watcher/hook/useFileWatcher'

export function useFileDialog() {
  const [fileStructure, setFileStructure] = useState<FileNode | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [watchId, setWatchId] = useState<string | null>(null)
  const { watchDirectory, stopWatchDirectory } = useFileWatcher()

  async function openFileDialog(dialogType: 'file' | 'directory') {
    try {
      const properties: OpenDialogOptions['properties'] =
        dialogType === 'file' ? ['openFile'] : ['openDirectory']

      const filePath = await window.api.fileSystem.openFileDialog({
        properties,
        title: `Select a ${dialogType}`,
        buttonLabel: 'Select'
      })

      if (filePath) {
        setIsLoading(true)

        if (watchId != null) {
          await stopWatchDirectory(watchId)
        }

        const structure = await window.api.fileSystem.getDirectoryStructure(filePath)
        const newWatchId = await watchDirectory(filePath)
        setWatchId(newWatchId)
        setFileStructure(structure)
        setSelectedFiles({})
      }
    } catch (error) {
      console.error('Error opening file dialog:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleBulkSelectionChange(paths: string[], node: FileNode, selected: boolean) {
    setSelectedFiles((prevSelected) => {
      const updated = { ...prevSelected }
      // Update all the provided paths
      for (const p of paths) {
        updated[p] = selected
      }

      let current = node.parent
      while (current && current.type === 'directory' && current.children) {
        const allChildrenSelected = current.children.every((child) => updated[child.path] === true)
        const noneChildrenSelected = current.children.every(
          (child) => !updated[child.path] || updated[child.path] === false
        )

        updated[current.path] = allChildrenSelected
          ? true
          : noneChildrenSelected
            ? false
            : 'indeterminate'

        current = current.parent
      }

      return updated
    })
  }

  return {
    fileStructure,
    setFileStructure,
    selectedFiles,
    isLoading,
    openFileDialog,
    handleBulkSelectionChange
  }
}
