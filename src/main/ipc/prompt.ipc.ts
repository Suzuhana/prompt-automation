import { ipcMain } from 'electron'
import promptGeneratorService from '../services/prompt-generator.service'
import { CHANNELS } from 'src/common/types/channel-names'
import { CreatePromptRequest } from 'src/common/types/prompt-types'

export function initPromptIPC(): void {
  ipcMain.handle(CHANNELS.PROMPT_CREATE, async (_event, request: CreatePromptRequest) => {
    return await promptGeneratorService.createPrompt(request)
  })
}

export function removePromptIPC(): void {
  ipcMain.removeHandler(CHANNELS.PROMPT_CREATE)
}
