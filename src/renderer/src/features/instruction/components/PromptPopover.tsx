import { Edit, Trash2, Plus, EyeOff, Eye } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@renderer/components/ui/popover'
import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Separator } from '@renderer/components/ui/separator'
import { usePrompts } from '../hooks/usePrompts'
import { PromptDialog } from './PromptDialog'

export function PromptPopover() {
  const {
    prompts,
    promptDialogRef,
    openDialog,
    handleSavePrompt,
    removePrompt,
    togglePromptEnabled
  } = usePrompts()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-24 h-6 justify-center">
          Prompts
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <div className="p-4 pb-2">
          <h4 className="font-medium text-sm mb-1">Manage Prompts</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Select, edit or delete your saved prompts
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center mb-2"
            onClick={() => openDialog('create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Button>
        </div>

        <Separator />

        <ScrollArea className="max-h-[250px] overflow-auto p-2">
          {prompts.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No prompts created yet
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {prompts.map((prompt) => (
                <div
                  key={prompt.name}
                  className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted/50 group"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{prompt.name}</span>
                    <span className="text-xs text-muted-foreground">{prompt.type}</span>
                  </div>
                  <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => togglePromptEnabled(prompt.name)}
                      title={prompt.enabled ? 'Deselect' : 'Select'}
                    >
                      {prompt.enabled ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openDialog('edit', prompt)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removePrompt(prompt.name)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Prompt dialog for create/edit */}
        <PromptDialog ref={promptDialogRef} onSave={handleSavePrompt} existingPrompts={prompts} />
      </PopoverContent>
    </Popover>
  )
}
