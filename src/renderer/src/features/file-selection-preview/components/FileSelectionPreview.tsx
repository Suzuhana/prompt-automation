import { Textarea } from '@renderer/components/ui/textarea'
import { Fragment } from 'react/jsx-runtime'

export function FileSelectionPreview(): JSX.Element {
  return (
    <Fragment>
      <h2 className="text-xl font-semibold">Selected Files</h2>
      <Textarea
        placeholder="Enter text here..."
        className="flex-grow resize-none" // flex-grow makes it expand, resize-none disables manual resizing handle
      />
    </Fragment>
  )
}
