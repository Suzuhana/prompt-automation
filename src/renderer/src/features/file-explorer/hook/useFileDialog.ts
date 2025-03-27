import { useState } from 'react'
import type { SelectedFiles } from '@/types/file'
import { OpenDialogOptions } from 'electron'
import { FileNode } from 'src/common/types/file'

export function useFileDialog() {
  const [fileStructure, setFileStructure] = useState<FileNode | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
        const structure = await window.api.fileSystem.getDirectoryStructure(filePath)
        setFileStructure(structure)
        setSelectedFiles({})
      }
    } catch (error) {
      console.error('Error opening file dialog:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    fileStructure,
    setFileStructure,
    selectedFiles,
    setSelectedFiles,
    isLoading,
    openFileDialog
  }
}
