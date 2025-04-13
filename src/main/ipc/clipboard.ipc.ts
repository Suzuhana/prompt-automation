import { ipcMain, clipboard } from 'electron'
import { CHANNELS } from 'src/common/types/channel-names'

export function initClipboardIPC(): void {
  ipcMain.handle(CHANNELS.CLIPBOARD_SEND, async (_event, text: string) => {
    try {
      clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Error in clipboard send handler:', error)
      throw error
    }
  })
}

export function removeClipboardIPC(): void {
  ipcMain.removeHandler(CHANNELS.CLIPBOARD_SEND)
}
