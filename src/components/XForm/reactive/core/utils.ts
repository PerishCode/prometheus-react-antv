import { __reactive__ } from './global'
import { Key, Raw, ReactiveFunction } from './types'

const KeyOfPrototypeFunctionWithEffect = new Set<Key>(['splice', 'copyWithin'])
const KeyOfIterateFunction = new Set<Key>([
  'forEach',
  'map',
  Symbol.iterator,
  'values',
  'keys',
  'every',
])

export function isIterateFunction(target: Raw, key: Key) {
  return KeyOfIterateFunction.has(key) && typeof target.constructor.prototype[key] === 'function'
}

/**
 * Check if target[key] is a Prototype function with effect, e.g. slice
 * @param target any object
 * @param key key of object
 */
export function isEffectFunction(target: Raw, key: Key) {
  return (
    KeyOfPrototypeFunctionWithEffect.has(key) &&
    typeof target.constructor.prototype[key] === 'function'
  )
}

export function isReactiveFunction(source: any): source is ReactiveFunction {
  return typeof source == 'function' && source[__reactive__]
}

export function isObject(source: any) {
  return typeof source === 'object' && source !== null
}
