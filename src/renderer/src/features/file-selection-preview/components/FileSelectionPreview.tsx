import { Fragment } from 'react/jsx-runtime'
import { PreviewGroup } from './PreviewGroup'

export function FileSelectionPreview(): JSX.Element {
  return (
    <Fragment>
      <h2 className="text-xl font-semibold">Selected Files</h2>
      <PreviewGroup
        directoryPath="test/aste/asts/a/at"
        files={[
          { name: 'test.ts', tokenSize: 280 },
          { name: 'test2.ts', tokenSize: 280 },
          { name: 'test3.ts', tokenSize: 280 }
        ]}
      ></PreviewGroup>
    </Fragment>
  )
}
