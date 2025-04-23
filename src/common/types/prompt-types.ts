export interface CreatePromptRequest {
  selectedFilePaths: string[]
  userInstruction: string
}

export interface Prompt {
  name: string
  type: string
  content: string
  enabled: boolean
}
