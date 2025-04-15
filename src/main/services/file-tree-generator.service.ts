import { NormalizedDirectoryStructure, NormalizedFileNode } from 'src/common/types/file-tree-types'

export class FileTreeGeneratorService {
  /**
   * Generates a compressed textual tree map from a normalized directory structure.
   * Directories with a single child directory are merged (e.g. "folder/subfolder").
   * @param structure The normalized directory structure built from the file map.
   * @returns A string representing the compressed file tree.
   */
  generateFileTree(structure: NormalizedDirectoryStructure): string {
    const map = structure.map
    const rootPath = structure.root
    const rootNode = map[rootPath]
    if (!rootNode) {
      return ''
    }
    const lines = [rootPath]
    if (rootNode.childPaths && rootNode.childPaths.length > 0) {
      // Sort children alphabetically by name
      const children = rootNode.childPaths
        .map((childPath) => map[childPath])
        .sort((a, b) => a.name.localeCompare(b.name))
      for (let i = 0; i < children.length; i++) {
        const isLast = i === children.length - 1
        const subtreeLines = this.buildTreeLines(children[i], map, '', isLast)
        lines.push(...subtreeLines)
      }
    }
    return lines.join('\n')
  }

  /**
   * Recursively builds the compressed tree lines.
   * Merges consecutive single-child directories into a single path.
   * @param node The current node (file or directory).
   * @param map The full normalized map of file nodes.
   * @param prefix The prefix for the current level (used for proper alignment).
   * @param isLast Determines if the current node is the last child.
   * @returns An array of strings representing this node and its children.
   */
  private buildTreeLines(
    node: NormalizedFileNode,
    map: { [path: string]: NormalizedFileNode },
    prefix: string,
    isLast: boolean
  ): string[] {
    let compressedName = node.name
    let current = node
    // Merge consecutive directories that have exactly one child which is also a directory
    while (current.type === 'directory' && current.childPaths?.length === 1) {
      const child = map[current.childPaths[0]]
      if (child.type === 'directory') {
        compressedName += '/' + child.name
        current = child
      } else {
        break
      }
    }
    const lines: string[] = []
    const connector = isLast ? '└── ' : '├── '
    lines.push(prefix + connector + compressedName)
    if (current.type === 'directory' && current.childPaths && current.childPaths.length > 0) {
      const children = current.childPaths
        .map((childPath) => map[childPath])
        .sort((a, b) => a.name.localeCompare(b.name))
      const newPrefix = prefix + (isLast ? '    ' : '│   ')
      for (let i = 0; i < children.length; i++) {
        const childIsLast = i === children.length - 1
        const childLines = this.buildTreeLines(children[i], map, newPrefix, childIsLast)
        lines.push(...childLines)
      }
    }
    return lines
  }
}

export const fileTreeGeneratorService = new FileTreeGeneratorService()
