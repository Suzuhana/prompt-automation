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
      return { name, path: dirPath, type: 'file' }
    }

    // Use readdirSync with { withFileTypes: true } to get file type info without extra stat calls
    const dirents = fs.readdirSync(dirPath, { withFileTypes: true })
    const children: FileNode[] = dirents
      .map((dirent) => {
        const childPath = path.join(dirPath, dirent.name)
        try {
          if (dirent.isDirectory()) {
            return FileSystemService.getDirectoryStructure(childPath)
          } else if (dirent.isFile()) {
            return { name: dirent.name, path: childPath, type: 'file' }
          } else {
            // Fallback for other types:
            const childStats = fs.statSync(childPath)
            return childStats.isDirectory()
              ? FileSystemService.getDirectoryStructure(childPath)
              : { name: dirent.name, path: childPath, type: 'file' }
          }
        } catch (error) {
          console.error(`Error reading ${childPath}:`, error)
          return null
        }
      })
      .filter(Boolean) as FileNode[]

    return { name, path: dirPath, type: 'directory', children }
  }
}
