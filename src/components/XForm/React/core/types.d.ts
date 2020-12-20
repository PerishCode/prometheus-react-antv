import { FunctionComponent } from 'react'
import { __render__ } from './global'

export interface CoreProps {
  schema: XSchema
  index?: string | number
  addition?: any
  path?: string
}

export interface XFormProps {
  schema?: any
  onChange?: (data: any) => void
  parser?: (data: any) => any
}

export interface XSchema {
  [__render__]: FunctionComponent<CoreProps>[]
  [key: string]: any
}
