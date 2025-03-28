import * as path from 'path'
import { promises as fs } from 'fs'
import { isBinaryFile } from 'isbinaryfile' // Use the async version
import { FileNode, FileNodeDirectory, FileNodeFile } from 'src/common/types/file-tree-types'

export const FileSystemService = {
  /**
   * Recursively get the structure of a directory or file (asynchronously).
   * @param dirPath Path to the directory or file
   * @returns FileNode structure representing the directory/file tree
   */
  async getDirectoryStructure(dirPath: string): Promise<FileNode> {
    const name = path.basename(dirPath)
    const stats = await fs.stat(dirPath)

    // If it's a file, return a FileNodeFile
    if (stats.isFile()) {
      const binary = await isBinaryFile(dirPath)
      const fileNode: FileNodeFile = {
        name,
        path: dirPath,
        type: 'file',
        isBinary: binary
        // parent not set for top-level file
      }
      return fileNode
    }

    // Otherwise, it's a directory. Create a FileNodeDirectory with an empty children array
    const dirNode: FileNodeDirectory = {
      name,
      path: dirPath,
      type: 'directory',
      children: []
      // parent not set for top-level directory
    }

    // Read entries asynchronously
    const dirents = await fs.readdir(dirPath, { withFileTypes: true })

    for (const dirent of dirents) {
      const childPath = path.join(dirPath, dirent.name)
      try {
        if (dirent.isDirectory()) {
          // Recursively process subdirectories
          const childNode = await FileSystemService.getDirectoryStructure(childPath)
          // Assign the parent field
          childNode.parent = dirNode
          dirNode.children.push(childNode)
        } else if (dirent.isFile()) {
          // Handle files
          const binary = await isBinaryFile(childPath)
          const childNode: FileNodeFile = {
            name: dirent.name,
            path: childPath,
            type: 'file',
            isBinary: binary,
            parent: dirNode
          }
          dirNode.children.push(childNode)
        }
        // For other types (symlinks, sockets, etc.), skip or handle as needed
      } catch (error) {
        console.error(`Error reading ${childPath}:`, error)
      }
    }

    return dirNode
  }
}
