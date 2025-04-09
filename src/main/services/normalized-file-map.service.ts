// main/services/normalized-file-map.service.ts
import * as fs from 'fs/promises'
import * as path from 'path'
import { isBinaryFile } from 'isbinaryfile'
import { WatcherEvent } from 'src/common/types/file-watcher-types'
import { BrowserWindow } from 'electron'
import { NormalizedDirectoryStructure, NormalizedFileNode } from 'src/common/types/file-tree-types'
import { CHANNELS } from 'src/common/types/channel-names'
import { encoding_for_model } from 'tiktoken'

class NormalizedFileMapService {
  // The normalized map: key is the absolute file path.
  private normalizedMap: Map<string, NormalizedFileNode> = new Map()
  // The root normalized node
  private root: string | null = null
  private notifyTimeout: NodeJS.Timeout | null = null

  /**
   * Recursively build the normalized file map starting at the given directory.
   * Returns an object containing the root node and the normalized map.
   */
  public async buildNormalizedMap(dirPath: string): Promise<NormalizedDirectoryStructure> {
    this.normalizedMap.clear()
    await this.recursiveBuild(dirPath, undefined)
    this.root = dirPath || null
    this.debouncedNotify()
    return { root: this.root!, map: Object.fromEntries(this.normalizedMap) }
  }

  private async recursiveBuild(currentPath: string, parentPath?: string): Promise<void> {
    const stats = await fs.stat(currentPath)
    if (stats.isDirectory()) {
      const dirNode: NormalizedFileNode = {
        path: currentPath,
        name: path.basename(currentPath),
        type: 'directory',
        parentPath,
        childPaths: []
      }
      this.normalizedMap.set(currentPath, dirNode)

      const entries = await fs.readdir(currentPath)
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry)
        dirNode.childPaths!.push(fullPath)
        await this.recursiveBuild(fullPath, currentPath)
      }
    } else {
      const fileNode = await this.buildFileNode(currentPath, parentPath)
      this.normalizedMap.set(currentPath, fileNode)
    }
  }

  /**
   * Update the normalized map based on a batch of file system events.
   */
  public async updateMapForEvents(events: WatcherEvent[]): Promise<void> {
    for (const event of events) {
      const { path: eventPath, type } = event
      try {
        if (type === 'delete') {
          const node = this.normalizedMap.get(eventPath)
          if (node && node.parentPath) {
            const parentNode = this.normalizedMap.get(node.parentPath)
            if (parentNode && parentNode.childPaths) {
              parentNode.childPaths = parentNode.childPaths.filter((p) => p !== eventPath)
            }
          }
          // If the deleted node is a directory, remove all descendants.
          if (node && node.type === 'directory') {
            for (const key of [...this.normalizedMap.keys()]) {
              if (key !== eventPath && key.startsWith(eventPath + path.sep)) {
                this.normalizedMap.delete(key)
              }
            }
          }
          this.normalizedMap.delete(eventPath)
        } else if (type === 'create' || type === 'update') {
          const stats = await fs.stat(eventPath)
          // Determine the parentPath from an existing node or by computing dirname.
          const oldNode = this.normalizedMap.get(eventPath)
          let computedParentPath: string | undefined
          if (oldNode && oldNode.parentPath) {
            computedParentPath = oldNode.parentPath
          } else if (this.root && eventPath !== this.root) {
            computedParentPath = path.dirname(eventPath)
          }

          if (stats.isDirectory()) {
            // Remove any existing subtree for the directory.
            for (const key of [...this.normalizedMap.keys()]) {
              if (key === eventPath || key.startsWith(eventPath + path.sep)) {
                this.normalizedMap.delete(key)
              }
            }
            // Rebuild the entire subtree recursively.
            await this.recursiveBuild(eventPath, computedParentPath)
            // Ensure the parent's childPaths include the new directory.
            if (computedParentPath) {
              const parentNode = this.normalizedMap.get(computedParentPath)
              if (
                parentNode &&
                parentNode.childPaths &&
                !parentNode.childPaths.includes(eventPath)
              ) {
                parentNode.childPaths.push(eventPath)
              }
            }
          } else {
            // For files, build a new file node
            const newNode = await this.buildFileNode(eventPath, computedParentPath)

            // Update parent's childPaths
            if (computedParentPath) {
              const parentNode = this.normalizedMap.get(computedParentPath)
              if (
                parentNode &&
                parentNode.childPaths &&
                !parentNode.childPaths.includes(eventPath)
              ) {
                parentNode.childPaths.push(eventPath)
              }
            }
            this.normalizedMap.set(eventPath, newNode)
          }
        }
      } catch (err) {
        console.error(`Error processing event for ${eventPath}:`, err)
      }
    }
    this.debouncedNotify()
  }

  private async buildFileNode(filePath: string, parentPath?: string): Promise<NormalizedFileNode> {
    const isBin = await isBinaryFile(filePath)
    const fileNode: NormalizedFileNode = {
      path: filePath,
      name: path.basename(filePath),
      type: 'file',
      parentPath,
      isBinary: isBin
    }

    if (!isBin) {
      // Read file content as UTF-8 text
      const text = await fs.readFile(filePath, 'utf8')
      // Estimate token count using tiktoken
      const model = 'o1-2024-12-17'
      const encoding = encoding_for_model(model)
      const tokens = encoding.encode(text)
      fileNode.tokenCount = tokens.length
      encoding.free()
    } else {
      fileNode.tokenCount = undefined
    }

    return fileNode
  }

  /**
   * Debounced renderer notification.
   */
  private debouncedNotify(delay = 500) {
    if (this.notifyTimeout) {
      clearTimeout(this.notifyTimeout)
    }
    this.notifyTimeout = setTimeout(() => {
      this.notifyRenderer()
    }, delay)
  }

  /**
   * Notify the renderer process with the updated normalized map and root.
   */
  private notifyRenderer() {
    // Convert the Map into a plain object.
    const normalizedObj = Object.fromEntries(this.normalizedMap)
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      win.webContents.send(CHANNELS.NORMALIZED_DIRECTORY_CHANGED, {
        root: this.root,
        map: normalizedObj
      })
    }
  }
}

export const normalizedFileMapService = new NormalizedFileMapService()
export default normalizedFileMapService
