import { app } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import defaultConfig from './defaultConfig.json'

/**
 * A simple file-based key-value store service
 * that saves data as JSON on disk and keeps
 * an in-memory copy for fast lookups.
 */
class FileBasedStoreService {
  private storeFilePath: string
  private data: Record<string, unknown> = {}

  private static instance: FileBasedStoreService

  private constructor() {
    // Example store file in the user's data path:
    this.storeFilePath = path.join(app.getPath('userData'), 'user-settings.json')
  }

  /**
   * Retrieves the singleton instance of FileBasedStoreService.
   */
  public static getInstance(): FileBasedStoreService {
    if (!FileBasedStoreService.instance) {
      FileBasedStoreService.instance = new FileBasedStoreService()
    }
    return FileBasedStoreService.instance
  }

  /**
   * Reads the store file from disk (if it exists)
   * and populates the in-memory 'data' object.
   */
  public async init(): Promise<void> {
    try {
      const raw = await fs.readFile(this.storeFilePath, 'utf8')
      this.data = JSON.parse(raw)
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException
      if (err.code === 'ENOENT') {
        // Store file not found: initialize with defaults and write them out
        this.data = defaultConfig as Record<string, unknown>
        await this.saveToDisk()
      } else {
        console.error('Error reading store file:', err)
        this.data = {}
      }
    }
  }
  /**
   * Get a value from the store by key.
   */
  public get(key: string): unknown {
    return this.data[key]
  }

  /**
   * Set a value in the store for the given key.
   * Saves the updated data to disk.
   */
  public async set(key: string, value: unknown): Promise<void> {
    this.data[key] = value
    await this.saveToDisk()
  }

  /**
   * Delete a key from the store.
   * Saves the updated data to disk.
   */
  public async delete(key: string): Promise<void> {
    delete this.data[key]
    await this.saveToDisk()
  }

  /**
   * Write the in-memory store to disk as JSON.
   */
  private async saveToDisk(): Promise<void> {
    try {
      await fs.writeFile(this.storeFilePath, JSON.stringify(this.data, null, 2), 'utf8')
    } catch (error) {
      console.error('Error saving store file:', error)
    }
  }
}

export const fileBasedStoreService = FileBasedStoreService.getInstance()
