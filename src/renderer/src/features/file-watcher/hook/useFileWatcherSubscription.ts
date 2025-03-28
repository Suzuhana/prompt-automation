import { useEffect, useRef } from 'react'

export function useFileWatcherSubscription() {
  const hasSubscribed = useRef(false)

  useEffect(() => {
    if (!hasSubscribed.current) {
      hasSubscribed.current = true
      window.api.fileSystem.subscriptToDirectoryChanged((data) => {
        for (const event of data.events) {
          console.log(event)
        }
      })
    }

    return () => {
      window.api.fileSystem.cancelSubDirectoryChanged()
    }
  }, [])
}
