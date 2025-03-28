// main/services/file-watcher.service.ts
import watcher from '@parcel/watcher'
import { WatcherEvent, WatcherSubscription } from 'src/common/types/file-watcher-types'
import { v4 as uuidv4 } from 'uuid'

interface ActiveWatcher {
  directory: string
  subscription: WatcherSubscription
}

// Map to store active watcher subscriptions keyed by an ID.
const activeWatchers = new Map<string, ActiveWatcher>()

export const FileWatcherService = {
  /**
   * Start watching a directory.
   * @param directory The directory path to watch.
   * @param eventCallback Callback invoked on file system events.
   * @returns A unique watch ID.
   */
  async watchDirectory(
    directory: string,
    eventCallback: (events: WatcherEvent[]) => void
  ): Promise<string> {
    // Subscribe to changes using @parcel/watcher
    const subscription = await watcher.subscribe(directory, (err, events) => {
      if (err) {
        console.error(`Error watching ${directory}:`, err)
        return
      }
      // Forward the events using the provided callback.
      eventCallback(events)
    })

    const watchId = uuidv4()
    activeWatchers.set(watchId, { directory, subscription })
    return watchId
  },

  /**
   * Stop watching a directory.
   * @param watchId The unique watch ID to cancel.
   */
  async unwatchDirectory(watchId: string): Promise<void> {
    const activeWatcher = activeWatchers.get(watchId)
    if (activeWatcher) {
      await activeWatcher.subscription.unsubscribe()
      activeWatchers.delete(watchId)
    }
  },

  /**
   * Remove all active watchers.
   */
  async removeAllWatchers(): Promise<void> {
    for (const [, watcher] of activeWatchers.entries()) {
      await watcher.subscription.unsubscribe()
    }
    activeWatchers.clear()
  }
}
