import * as fs from 'fs/promises'
import * as path from 'path'
import { isBinaryFile } from 'isbinaryfile'
import { WatcherEvent } from 'src/common/types/file-watcher-types'
import { BrowserWindow } from 'electron'
import { NormalizedDirectoryStructure, NormalizedFileNode } from 'src/common/types/file-tree-types'
import { CHANNELS } from 'src/common/types/channel-names'
import { readdirp } from 'readdirp'
import { fileTreeGeneratorService } from './file-tree-generator.service'
import { estimateTextTokens } from 'src/common/utils/token-estimator'
import { fileBasedStoreService } from './file-based-store.service'
import { Minimatch } from 'minimatch'

class NormalizedFileMapService {
  private normalizedMap: Map<string, NormalizedFileNode> = new Map()
  private root: string | null = null
  private notifyTimeout: NodeJS.Timeout | null = null
  private ignoredPatterns: string[] = []

  public async buildNormalizedMap(dirPath: string): Promise<NormalizedDirectoryStructure> {
    this.normalizedMap.clear()
    await this.loadIgnorePatterns()
    this.root = dirPath || null

    await this.buildMapUsingReaddirp(dirPath)

    // Populate file details for each file node in the map after the tree is built
    const fileDetailPromises: Promise<void>[] = []
    for (const [filePath, node] of this.normalizedMap.entries()) {
      if (node.type === 'file') {
        fileDetailPromises.push(this.populateFileDetailsForPath(filePath))
      }
    }
    await Promise.all(fileDetailPromises)

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
            const newNode = await this.buildBasicFileNode(eventPath, computedParentPath)
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
            // Populate detailed file info asynchronously for the updated/created file
            await this.populateFileDetailsForPath(eventPath)
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

  public async getFileTree(): Promise<string> {
    if (!this.root) {
      return ''
    }
    // If the normalized map is empty, lazy initialize it
    if (this.normalizedMap.size === 0) {
      await this.buildNormalizedMap(this.root)
    }
    const structure: NormalizedDirectoryStructure = {
      root: this.root,
      map: Object.fromEntries(this.normalizedMap)
    }
    return fileTreeGeneratorService.generateFileTree(structure)
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
        // Create a file node with basic info only
        const fileNode = await this.buildBasicFileNode(fullPath, parent)
        this.normalizedMap.set(fullPath, fileNode)
        // Link file to parent's childPaths
        const parentNode = this.getOrCreateDirectoryNode(parent)
        if (!parentNode.childPaths!.includes(fullPath)) {
          parentNode.childPaths!.push(fullPath)
        }
      }
    }
  }

  private async populateFileDetailsForPath(filePath: string): Promise<void> {
    const node = this.normalizedMap.get(filePath)
    if (!node || node.type !== 'file') {
      return
    }
    try {
      const isBin = await isBinaryFile(filePath)
      node.isBinary = isBin
      if (!isBin) {
        const text = await fs.readFile(filePath, 'utf8')
        // Use fast token estimation instead of expensive tokenization via tiktoken.
        node.tokenCount = estimateTextTokens(text)
      } else {
        node.tokenCount = undefined
      }
      this.normalizedMap.set(filePath, node)
    } catch (error) {
      console.error(`Error populating details for file ${filePath}:`, error)
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

  private async buildBasicFileNode(
    filePath: string,
    parentPath?: string
  ): Promise<NormalizedFileNode> {
    const fileNode: NormalizedFileNode = {
      path: filePath,
      name: path.basename(filePath),
      type: 'file',
      parentPath
      // isBinary and tokenCount will be populated later via populateFileDetailsForPath()
    }
    return fileNode
  }

  /**
   * Populate `ignoredPatterns` from the persisted user configuration.
   * Patterns may be absolute paths or glob expressions and are normalised
   * to POSIX style so that glob matching behaves consistently on every OS.
   *
   * Note: any repository-specific ignores (e.g. .git, .gitignore contents)
   * will be supplied by the single store config elsewhere.
   */
  private async loadIgnorePatterns(): Promise<void> {
    try {
      const stored = fileBasedStoreService.get('ignorePatterns')

      if (Array.isArray(stored)) {
        // Keep only non-empty string patterns and convert “\” → “/”
        this.ignoredPatterns = (stored as unknown[])
          .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
          .map((p) => p.replace(/\\/g, '/'))
      } else {
        this.ignoredPatterns = []
      }
    } catch {
      this.ignoredPatterns = []
    }
  }

  /**
   * Check whether a file or directory should be ignored.
   * Uses `glob`/`Minimatch` so both simple paths and complex glob
   * patterns are supported
   */
  private isIgnored(targetPath: string): boolean {
    if (!this.root || this.ignoredPatterns.length === 0) {
      return false
    }

    // Convert to a POSIX-style relative path for reliable matching
    const relativePath = path.relative(this.root, targetPath).replace(/\\/g, '/')

    return this.ignoredPatterns.some((pattern) => {
      const matcher = new Minimatch(pattern, {
        dot: true, // match files starting with "."
        matchBase: true, // allow basename matches like "node_modules"
        nocase: process.platform === 'win32' // case-insensitive on Windows
      })
      return matcher.match(relativePath)
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
