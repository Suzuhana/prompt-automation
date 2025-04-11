import * as fs from 'fs/promises'
import * as path from 'path'
import { isBinaryFile } from 'isbinaryfile'
import { WatcherEvent } from 'src/common/types/file-watcher-types'
import { BrowserWindow } from 'electron'
import { NormalizedDirectoryStructure, NormalizedFileNode } from 'src/common/types/file-tree-types'
import { CHANNELS } from 'src/common/types/channel-names'
import { encoding_for_model } from 'tiktoken'
import { readdirp } from 'readdirp'

class NormalizedFileMapService {
  private normalizedMap: Map<string, NormalizedFileNode> = new Map()
  private root: string | null = null
  private notifyTimeout: NodeJS.Timeout | null = null
  private ignoredPatterns: string[] = []

  public async buildNormalizedMap(dirPath: string): Promise<NormalizedDirectoryStructure> {
    this.normalizedMap.clear()
    await this.loadIgnorePatterns(dirPath)
    this.root = dirPath || null

    await this.buildMapUsingReaddirp(dirPath)

    this.debouncedNotify()
    return { root: this.root!, map: Object.fromEntries(this.normalizedMap) }
  }

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
          if (node && node.type === 'directory') {
            for (const key of [...this.normalizedMap.keys()]) {
              if (key !== eventPath && key.startsWith(eventPath + path.sep)) {
                this.normalizedMap.delete(key)
              }
            }
          }
          this.normalizedMap.delete(eventPath)
        } else if (type === 'create' || type === 'update') {
          if (this.isIgnored(eventPath)) {
            this.normalizedMap.delete(eventPath)
            continue
          }
          const stats = await fs.stat(eventPath)
          const oldNode = this.normalizedMap.get(eventPath)
          let computedParentPath: string | undefined
          if (oldNode && oldNode.parentPath) {
            computedParentPath = oldNode.parentPath
          } else if (this.root && eventPath !== this.root) {
            computedParentPath = path.dirname(eventPath)
          }

          if (stats.isDirectory()) {
            for (const key of [...this.normalizedMap.keys()]) {
              if (key === eventPath || key.startsWith(eventPath + path.sep)) {
                this.normalizedMap.delete(key)
              }
            }
            await this.buildMapUsingReaddirp(eventPath, computedParentPath)
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
          } else if (stats.isFile()) {
            const newNode = await this.buildFileNode(eventPath, computedParentPath)
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
          } else {
            this.normalizedMap.delete(eventPath)
          }
        }
      } catch (err) {
        console.error(`Error processing event for ${eventPath}:`, err)
      }
    }
    this.debouncedNotify()
  }

  private async buildMapUsingReaddirp(dirPath: string, parentPath?: string): Promise<void> {
    // Make sure there's a node for the root directory of this subtree
    this.getOrCreateDirectoryNode(dirPath, parentPath)

    // Link it under the parent if parent is provided
    if (parentPath) {
      const parentDir = this.getOrCreateDirectoryNode(parentPath)
      if (!parentDir.childPaths!.includes(dirPath)) {
        parentDir.childPaths!.push(dirPath)
      }
    }

    // Collect files & directories using readdirp
    for await (const entry of readdirp(dirPath, {
      type: 'files_directories',
      alwaysStat: true,
      fileFilter: (f) => !this.isIgnored(f.fullPath) && (f.stats as import('fs').Stats).isFile(),
      directoryFilter: (d) =>
        !this.isIgnored(d.fullPath) && (d.stats as import('fs').Stats).isDirectory()
    })) {
      const fullPath = entry.fullPath
      const stats = entry.stats!
      // The directory that holds this entry
      const parent = path.dirname(fullPath) !== dirPath ? path.dirname(fullPath) : dirPath

      if (stats.isDirectory()) {
        // Create/get the directory node
        this.getOrCreateDirectoryNode(fullPath, parent)
        // Also link to parent's childPaths
        const parentNode = this.getOrCreateDirectoryNode(parent)
        if (!parentNode.childPaths!.includes(fullPath)) {
          parentNode.childPaths!.push(fullPath)
        }
      } else if (stats.isFile()) {
        // Create a file node
        const fileNode = await this.buildFileNode(fullPath, parent)
        this.normalizedMap.set(fullPath, fileNode)
        // Link file to parent's childPaths
        const parentNode = this.getOrCreateDirectoryNode(parent)
        if (!parentNode.childPaths!.includes(fullPath)) {
          parentNode.childPaths!.push(fullPath)
        }
      }
    }
  }

  private getOrCreateDirectoryNode(dirPath: string, parentPath?: string): NormalizedFileNode {
    const existing = this.normalizedMap.get(dirPath)
    if (existing && existing.type === 'directory') {
      if (parentPath && !existing.parentPath) {
        existing.parentPath = parentPath
      }
      return existing
    }
    const node: NormalizedFileNode = {
      path: dirPath,
      name: path.basename(dirPath),
      type: 'directory',
      parentPath,
      childPaths: []
    }
    this.normalizedMap.set(dirPath, node)
    return node
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
      const text = await fs.readFile(filePath, 'utf8')
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

  private async loadIgnorePatterns(dirPath: string): Promise<void> {
    try {
      const gitignorePath = path.join(dirPath, '.gitignore')
      const data = await fs.readFile(gitignorePath, 'utf8')
      const lines = data.split('\n')
      this.ignoredPatterns = lines
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .concat(['.git'])
    } catch {
      this.ignoredPatterns = []
    }
  }

  private isIgnored(targetPath: string): boolean {
    if (!this.root) {
      return false
    }
    const relativePath = path.relative(this.root, targetPath).replace(/\\/g, '/')
    return this.ignoredPatterns.some((pattern) => {
      const normalizedPattern = pattern.replace(/^\/+|\/+$/g, '')
      return relativePath.includes(normalizedPattern)
    })
  }

  private debouncedNotify(delay = 500) {
    if (this.notifyTimeout) {
      clearTimeout(this.notifyTimeout)
    }
    this.notifyTimeout = setTimeout(() => {
      this.notifyRenderer()
    }, delay)
  }

  private notifyRenderer() {
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
