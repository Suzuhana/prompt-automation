import { Button } from '@/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Search, X } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/components/ui/tooltip'

type SearchBarProps = {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  fuzzySearch: boolean
  onToggleFuzzy: () => void
}

export function SearchBar({
  searchQuery,
  onSearchQueryChange,
  fuzzySearch,
  onToggleFuzzy
}: SearchBarProps) {
  return (
    <div className="flex space-x-4 items-center">
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          size={16}
        />
        <Input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-28 py-1 rounded text-sm w-full"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
        <div className="absolute right-0.5 top-1/2 transform -translate-y-1/2 flex items-center">
          {searchQuery.trim().length > 0 && (
            <Button variant="ghost" onClick={() => onSearchQueryChange('')} size="sm">
              <X size={8} className="text-gray-500" />
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle size="sm" pressed={fuzzySearch} onClick={onToggleFuzzy}>
                  F
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle fuzzy search</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
