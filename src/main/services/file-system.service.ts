import * as fs from 'fs'
import * as path from 'path'
import { FileNode } from 'src/common/types/file'
import { isBinaryFileSync } from 'isbinaryfile'

export const FileSystemService = {
  /**
   * Recursively get the structure of a directory or file.
   * @param dirPath Path to the directory or file
   * @returns FileNode structure representing the directory/file tree
   */
  getDirectoryStructure(dirPath: string): FileNode {
    const name = path.basename(dirPath)
    const stats = fs.statSync(dirPath)

    // If it's a file, return immediately
    if (stats.isFile()) {
      return {
        name,
        path: dirPath,
        type: 'file',
        isBinary: isBinaryFileSync(dirPath)
      }
    }

    // Use readdirSync with { withFileTypes: true } to iterate without extra stat calls
    const dirents = fs.readdirSync(dirPath, { withFileTypes: true })
    const children: FileNode[] = dirents
      .map((dirent) => {
        const childPath = path.join(dirPath, dirent.name)

        try {
          if (dirent.isDirectory()) {
            // Recursively process directories
            return FileSystemService.getDirectoryStructure(childPath)
          } else if (dirent.isFile()) {
            // Directly handle files
            return {
              name: dirent.name,
              path: childPath,
              type: 'file',
              isBinary: isBinaryFileSync(childPath)
            }
          } else {
            // For other types (e.g., symlinks, sockets, etc.), skip or handle as needed:
            return null
          }
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
