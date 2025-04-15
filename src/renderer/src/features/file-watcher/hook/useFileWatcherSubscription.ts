import { useAppStore } from '@renderer/store'
import { useEffect, useRef } from 'react'

export function useFileWatcherSubscription() {
  const hasSubscribed = useRef(false)
  const initializeWithTreeRoot = useAppStore((state) => state.initializeWithTreeRoot)

  useEffect(() => {
    if (!hasSubscribed.current) {
      hasSubscribed.current = true
      window.api.fileSystem.subscriptToDirectoryChanged((data) => {
        // Group events under a header with the current time
        console.group(`Directory Changed at ${new Date().toLocaleTimeString()}`)
        data.events.forEach((event, index) => {
          console.log(`Event ${index + 1}:`, event)
        })
        console.groupEnd()
      })
      window.api.fileSystem.subscriptToNormalizedDirectoryChanged((data) => {
        initializeWithTreeRoot(data.root, data.map, false)
      })
    }

    return () => {
      window.api.fileSystem.cancelSubDirectoryChanged()
      window.api.fileSystem.cancelSubNormalizedDirectoryChanged()
    }
  }, [initializeWithTreeRoot])
}
