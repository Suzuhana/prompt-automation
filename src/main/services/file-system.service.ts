import * as path from 'path'
import { promises as fs } from 'fs'
import { isBinaryFile } from 'isbinaryfile' // Use the async version
import { FileNode } from 'src/common/types/file'

export const FileSystemService = {
  /**
   * Recursively get the structure of a directory or file (asynchronously).
   * @param dirPath Path to the directory or file
   * @returns FileNode structure representing the directory/file tree
   */
  async getDirectoryStructure(dirPath: string): Promise<FileNode> {
    const name = path.basename(dirPath)
    const stats = await fs.stat(dirPath)

    // If it's a file, return immediately
    if (stats.isFile()) {
      const binary = await isBinaryFile(dirPath)
      return {
        name,
        path: dirPath,
        type: 'file',
        isBinary: binary
      }
    }

    // If it's a directory, read entries asynchronously
    const dirents = await fs.readdir(dirPath, { withFileTypes: true })
    const children: FileNode[] = []

    for (const dirent of dirents) {
      const childPath = path.join(dirPath, dirent.name)
      try {
        if (dirent.isDirectory()) {
          // Recursively process directories
          const childNode = await FileSystemService.getDirectoryStructure(childPath)
          children.push(childNode)
        } else if (dirent.isFile()) {
          // Directly handle files
          const binary = await isBinaryFile(childPath)
          children.push({
            name: dirent.name,
            path: childPath,
            type: 'file',
            isBinary: binary
          })
        }
        // For other types (e.g., symlinks, sockets, etc.), skip or handle as needed
      } catch (error) {
        console.error(`Error reading ${childPath}:`, error)
      }
    }

    return {
      name,
      path: dirPath,
      type: 'directory',
      children
    }
  }
}
