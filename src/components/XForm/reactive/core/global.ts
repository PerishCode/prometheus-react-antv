import { Raw, Reaction, CallbackMap, Key, Callback } from './types'

export const __iterate__ = Symbol('key for all iterate callback')
export const __reactive__ = Symbol('key for reactive function')
export const __observed__ = Symbol('Mark a function as observed')

export const rawToReaction = new WeakMap<Raw, Reaction>()
export const reactionToRaw = new WeakMap<Reaction, Raw>()
export const rawToCallbackMap = new WeakMap<Raw, CallbackMap>()
export const rawToListenerMap = new WeakMap<Raw, Map<Key, Callback>>()

export const rawToVisitSet = new WeakMap<Raw, Set<Key>>()
export const rawToParent = new WeakMap<Raw, Reaction>()
export const globalCallback = new Set<Callback>()
export const callbackStack = new Array<Callback>()
