import { CheckedState } from '@radix-ui/react-checkbox'
import { NormalizedFileNode } from 'src/common/types/file-tree-types'

export type CheckedNormalizedFileNode = NormalizedFileNode & { selected: CheckedState }
