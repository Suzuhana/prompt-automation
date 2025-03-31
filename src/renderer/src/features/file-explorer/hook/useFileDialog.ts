import { useState } from 'react'
import { OpenDialogOptions } from 'electron'
import { useFileWatcher } from '@renderer/features/file-watcher/hook/useFileWatcher'
import { useAppStore } from '@renderer/store'

export function useFileDialog() {
  const rootPath = useAppStore((state) => state.rootPath)
  const initializeWithTreeRoot = useAppStore((state) => state.initializeWithTreeRoot)

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

        const { root, map } = await window.api.fileSystem.getNormalizedDirectoryStructure(filePath)
        const newWatchId = await watchDirectory(filePath)
        setWatchId(newWatchId)
        initializeWithTreeRoot(root, map)
        // Removed setSelectedFiles as selection is now part of the normalized tree
      }
    } catch (error) {
      console.error('Error opening file dialog:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    rootPath,
    isLoading,
    openFileDialog
  }
}
