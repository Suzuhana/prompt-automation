import * as fs from 'fs/promises'

/**
 * Reads a list of files from disk (UTF-8) and returns
 * an object mapping filePath → fileContent.
 *
 * @param filePaths An array of file paths to read.
 * @returns A Promise resolving to Record<string, string>.
 */
export async function readFilesAsStrings(filePaths: string[]): Promise<Record<string, string>> {
  const fileReadPromises = filePaths.map(async (filePath) => {
    const content = await fs.readFile(filePath, 'utf8')
    return { filePath, content }
  })

  const results = await Promise.all(fileReadPromises)
  return results.reduce(
    (acc, { filePath, content }) => {
      acc[filePath] = content
      return acc
    },
    {} as Record<string, string>
  )
}
