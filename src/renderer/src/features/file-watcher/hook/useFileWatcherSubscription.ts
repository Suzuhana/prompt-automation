import { useEffect, useRef } from 'react'

export function useFileWatcherSubscription() {
  const hasSubscribed = useRef(false)

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
    }

    return () => {
      window.api.fileSystem.cancelSubDirectoryChanged()
    }
  }, [])
}
