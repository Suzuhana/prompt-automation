export function useFileWatcher() {
  async function watchDirectory(dir: string) {
    return window.api.fileSystem.watchDirectory(dir)
  }

  async function stopWatchDirectory(watchId: string) {
    return window.api.fileSystem.stopWatchDirectory(watchId)
  }

  return {
    watchDirectory,
    stopWatchDirectory
  }
}
