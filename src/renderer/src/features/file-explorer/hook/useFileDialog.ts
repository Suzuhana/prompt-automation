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
        await loadWithPath(filePath)
      }
    } catch (error) {
      console.error('Error opening file dialog:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadWithPath(filePath: string) {
    // show loading spinner
    setIsLoading(true)

    // stop watching previous directory if any
    if (watchId != null) {
      await stopWatchDirectory(watchId)
    }

    // get normalized directory structure for the selected path
    const { root, map } = await window.api.fileSystem.getNormalizedDirectoryStructure(filePath)

    // start watching the new directory
    const newWatchId = await watchDirectory(filePath)
    setWatchId(newWatchId)

    // initialize the file tree in the UI
    initializeWithTreeRoot(root, map, true)
    setIsLoading(false)
  }

  return {
    rootPath,
    isLoading,
    openFileDialog,
    loadWithPath
  }
}
