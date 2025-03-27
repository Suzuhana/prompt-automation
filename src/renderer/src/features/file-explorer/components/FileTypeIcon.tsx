import { File, Folder } from 'lucide-react'
import { FileNode } from 'src/common/types/file'

interface FileTypeIconProps {
  type: FileNode['type']
}

export function FileTypeIcon({ type }: FileTypeIconProps) {
  if (type === 'directory') {
    return <Folder size={16} className="mr-2 text-blue-500" />
  }
  return <File size={16} className="mr-2 text-gray-500" />
}
