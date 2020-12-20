import { __reactive__ } from './global'

/** key for visiting Raw/Proxy's attribute  */
export type Key = string | number | symbol

/** raw object type */
export type Raw = object

/** proxy object type */
export type Reaction = object

export type ReactiveFunction = Function & { [__reactive__]: Boolean }

export type Callback = Function & { cleaners?: CallbackSet[] }

export type CallbackSet = Set<Callback>

export type CallbackMap = Map<Key, CallbackSet>

export interface Operation {
  type?: 'get' | 'iterate' | 'add' | 'set' | 'delete' | 'clear' | 'has' | 'any'
  target: Raw
  key: Key
  receiver?: any
  value?: any
  oldValue?: any
}
