import * as path from 'path'
import { readFilesAsStrings } from './file-reader.service'
import { CreatePromptRequest } from 'src/common/types/prompt-types'

/**
 * Service responsible for assembling prompt content.
 * Designed to be extensible for future sections/requirements.
 */
export const promptGeneratorService = {
  /**
   * Creates a prompt consisting of:
   * 1. <file_contents> section (for each file in selectedFilePaths)
   * 2. <user_instructions> section (from user input)
   */
  async createPrompt(request: CreatePromptRequest): Promise<string> {
    // Step 1: Read all selected files
    const filesMap = await readFilesAsStrings(request.selectedFilePaths)

    // Step 2: Build the file_contents section
    const promptSections: string[] = []
    promptSections.push('<file_contents>')
    for (let i = 0; i < request.selectedFilePaths.length; i++) {
      const filePath = request.selectedFilePaths[i]
      const fileContent = filesMap[filePath] ?? ''
      // Derive extension (strip leading dot)
      const extension = path.extname(filePath).replace(/^\./, '') || ''
      promptSections.push(`File: ${filePath}`)
      promptSections.push('```' + extension)
      promptSections.push(fileContent)
      promptSections.push('```')
      // Only add a blank line if this is not the last file
      if (i < request.selectedFilePaths.length - 1) {
        promptSections.push('') // Blank line for readability
      }
    }
    promptSections.push('</file_contents>')
    promptSections.push('') // Blank line to separate sections

    // Step 3: Append user instructions
    promptSections.push('<user_instructions>')
    promptSections.push(request.userInstruction.trim())
    promptSections.push('</user_instructions>')

    // Combine all sections into a single string
    return promptSections.join('\n')
  }
}

export default promptGeneratorService
