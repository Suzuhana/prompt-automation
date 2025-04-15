import * as path from 'path'
import { readFilesAsStrings } from './file-reader.service'
import { CreatePromptRequest, Prompt } from 'src/common/types/prompt-types'
import { fileBasedStoreService } from './file-based-store.service'
import normalizedFileMapService from './normalized-file-map.service'
/**
 * Service responsible for assembling prompt content.
 * Designed to be extensible for future sections/requirements.
 */
export const promptGeneratorService = {
  /**
   * Creates a prompt consisting of:
   * 1. <file_map> section (contains file tree of the project)
   * 2. <file_contents> section (for each file in selectedFilePaths)
   * 3. <prompts> section (reads Prompt[] from file-backed store)
   * 4. <user_instructions> section (from user input)
   */
  async createPrompt(request: CreatePromptRequest): Promise<string> {
    // Step 0: Get the file tree (lazy initialization if needed)
    const fileTree = await normalizedFileMapService.getFileTree()

    const promptSections: string[] = []
    promptSections.push('<file_map>')
    promptSections.push(fileTree)
    promptSections.push('</file_map>')
    promptSections.push('') // Blank line for separation

    // Step 1: Read all selected files
    const filesMap = await readFilesAsStrings(request.selectedFilePaths)

    // Step 2: Build the file_contents section
    promptSections.push('<file_contents>')
    for (let i = 0; i < request.selectedFilePaths.length; i++) {
      const filePath = request.selectedFilePaths[i]
      const fileContent = filesMap[filePath] ?? ''
      const extension = path.extname(filePath).replace(/^\./, '') || ''
      promptSections.push(`File: ${filePath}`)
      promptSections.push('```' + extension)
      promptSections.push(fileContent)
      promptSections.push('```')
      if (i < request.selectedFilePaths.length - 1) {
        promptSections.push('')
      }
    }
    promptSections.push('</file_contents>')
    promptSections.push('') // Blank line for separation

    // Step 2.5: Append the prompts section from the file-backed store
    const storedPrompts = fileBasedStoreService.get('prompts') as Prompt[] | undefined
    if (storedPrompts && Array.isArray(storedPrompts) && storedPrompts.length > 0) {
      promptSections.push('<prompts>')
      for (const prompt of storedPrompts) {
        promptSections.push(`<prompt type="${prompt.type}" name="${prompt.name}">`)
        promptSections.push(prompt.content)
        promptSections.push('</prompt>')
      }
      promptSections.push('</prompts>')
      promptSections.push('') // Blank line for separation
    }

    // Step 3: Append user instructions
    promptSections.push('<user_instructions>')
    promptSections.push(request.userInstruction.trim())
    promptSections.push('</user_instructions>')

    // Combine all sections into a single string
    return promptSections.join('\n')
  }
}

export default promptGeneratorService
