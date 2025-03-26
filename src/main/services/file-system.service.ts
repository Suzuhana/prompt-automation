import * as fs from 'fs'
import * as path from 'path'

/**
 * Interface representing a file or directory node in the tree structure
 */
export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

/**
 * A simple service to fetch filesystem details
 */
export const FileSystemService = {
  /**
   * Recursively get the structure of a directory or file.
   * @param dirPath Path to the directory or file
   * @returns FileNode structure representing the directory/file tree
   */
  getDirectoryStructure(dirPath: string): FileNode {
    const name = path.basename(dirPath)
    const stats = fs.statSync(dirPath)

    if (stats.isFile()) {
      return {
        name,
        path: dirPath,
        type: 'file'
      }
    }

    const children: FileNode[] = fs
      .readdirSync(dirPath)
      .map((child) => {
        const childPath = path.join(dirPath, child)
        try {
          return FileSystemService.getDirectoryStructure(childPath)
        } catch (error) {
          console.error(`Error reading ${childPath}:`, error)
          return null
        }
      })
      .filter(Boolean) as FileNode[]

    return {
      name,
      path: dirPath,
      type: 'directory',
      children
    }
  }
}
