import { ChevronDown, ChevronRight } from 'lucide-react'

interface ExpansionIndicatorProps {
  isExpanded: boolean
  isVisible: boolean // Show indicator only for directories
}

export function ExpansionIndicator({ isExpanded, isVisible }: ExpansionIndicatorProps) {
  if (!isVisible) {
    // Render a spacer to maintain alignment for files
    return <span className="mr-1 w-4 inline-block" />
  }

  return (
    <span className="mr-1 text-gray-500">
      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </span>
  )
}
