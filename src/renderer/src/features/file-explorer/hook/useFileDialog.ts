import { useState } from 'react'
import { OpenDialogOptions } from 'electron'
import { useFileWatcher } from '@renderer/features/file-watcher/hook/useFileWatcher'
import { useAppStore } from '@renderer/store'

export function useFileDialog() {
  const rootNode = useAppStore((state) => state.treeRoot)
  const initializeWithTreeRoot = useAppStore((state) => state.initializeWithTreeRoot)
  const selectedFiles = useAppStore((state) => state.selectedFiles)
  const setSelectedFiles = useAppStore((state) => state.setSelectedFiles)

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
        initializeWithTreeRoot(structure)
        setSelectedFiles({})
      }
    } catch (error) {
      console.error('Error opening file dialog:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    fileStructure: rootNode,
    selectedFiles,
    isLoading,
    openFileDialog
  }
}
