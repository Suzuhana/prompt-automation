import watcher from '@parcel/watcher'

export type WatcherSubscription = watcher.AsyncSubscription
export type WatcherEvent = watcher.Event

export interface DirectoryChangedData {
  watchId: string
  events: WatcherEvent[]
}
