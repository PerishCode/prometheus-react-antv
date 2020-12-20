import { reactive } from '.'
import {
  callbackStack,
  globalCallback,
  rawToCallbackMap,
  rawToListenerMap,
  rawToParent,
  rawToReaction,
  rawToVisitSet,
  reactionToRaw,
  __iterate__,
  __observed__,
} from './global'
import { Callback, CallbackMap, Key, Operation, Reaction } from './types'
import {
  isIterateFunction,
  isObject,
  isEffectFunction,
  isReactiveFunction,
} from './utils'

/** wrap the callback so that the callback will be in the stack during the call */
function wrap(callback: Callback, f: Function, context: any, args: any[]) {
  if (callback[__observed__]) return Reflect.apply(f, context, args)
  if (callbackStack.includes(callback)) return

  callbackStack.push(callback)
  const result = Reflect.apply(f, context, args)

  callbackStack.pop()
  callback[__observed__] = true

  return result
}

/** invoke the target function as a Callback */
function observe(f: Function): Callback {
  const callback = (...args: any[]) => wrap(callback, f, this, args)
  callback()
  return callback
}

function unobserve(callback: Callback) {
  callback?.cleaners?.forEach(callbackSet => callbackSet.delete(callback))
}

function mountCallback(callback: Callback, { target, key }: Operation) {
  let callbackMap = rawToCallbackMap.get(target)

  if (callbackMap === undefined) {
    callbackMap = new Map()
    rawToCallbackMap.set(target, callbackMap)
  }

  let callbackSet = callbackMap.get(key)

  if (callback.cleaners === undefined) callback.cleaners = []

  if (!callbackSet) {
    callbackSet = new Set()
    callbackMap.set(key, callbackSet)
  }

  if (!callbackSet.has(callback)) {
    callbackSet.add(callback)
    callback.cleaners.push(callbackSet)
  }
}

function registerReactiveFunction(f: Function, operation: Operation) {
  const { target, key } = operation

  const copy = f.bind(null)
  const reaction = rawToReaction.get(target)
  let listernerMap = rawToListenerMap.get(target)

  if (listernerMap === undefined) {
    listernerMap = new Map()
    rawToListenerMap.set(target, listernerMap)
  }

  unobserve(listernerMap.get(key) as Callback)

  listernerMap.set(
    key,
    observe(operation => {
      Reflect.set(reaction as object, key, copy(reaction, operation))
    })
  )

  return target[key]
}

let triggerDepth = 0
let isPrototypeRunning = false

function triggerCallback(operation: Operation) {
  const { target, key } = operation

  const callbackMap = rawToCallbackMap.get(target)
  const triggerSet = new Set<Callback>()

  if (key !== __iterate__)
    callbackMap?.get(key)?.forEach(c => triggerSet.add(c))
  if (!isPrototypeRunning && target.constructor.prototype[key] === undefined)
    callbackMap?.get(__iterate__)?.forEach(c => triggerSet.add(c))

  ++triggerDepth
  triggerSet.forEach(c => c(operation))
  --triggerDepth

  if (
    !isPrototypeRunning &&
    !triggerDepth &&
    target.constructor.prototype[key] === undefined
  )
    globalCallback.forEach(c => c(operation))
}

function parseSource(operation: Operation) {
  const { target, key } = operation

  if (key === '$') return rawToParent.get(target)
  if (callbackStack.length === 0) return target[key]

  const callback = callbackStack[callbackStack.length - 1]
  const visitSet = rawToVisitSet.get(target)

  // 调用遍历方法时，记录所有 key ，并在访问过所有 key 后注册回调方法
  if (
    isIterateFunction(target, key) &&
    !rawToCallbackMap.get(target)?.get(__iterate__)?.has(callback)
  ) {
    rawToVisitSet.set(target, new Set(Object.keys(target)))
  } else if (visitSet) {
    visitSet.delete(key)
    if (visitSet.size === 0) {
      rawToVisitSet.delete(target)
      mountCallback(callback, { target, key: __iterate__ })
    }
  } else {
    mountCallback(callback, { target, key })
  }

  return target[key]
}

function wrapEffectFunction(target: Reaction, key: Key) {
  return (...args: any[]) => {
    isPrototypeRunning = true
    const result = Array.prototype[key].apply(rawToReaction.get(target), args)
    isPrototypeRunning = false
    triggerCallback({ target, key: __iterate__ })
    return result
  }
}

const baseHandlers = {
  get(target, key, receiver) {
    let result = parseSource({ target, key, receiver })
    if (isEffectFunction(target, key)) result = wrapEffectFunction(target, key)
    if (isReactiveFunction(result))
      result = registerReactiveFunction(result, { target, key })
    if (!isObject(result)) return result
    if (!rawToParent.has(result))
      rawToParent.set(result, rawToReaction.get(target) as object)
    return rawToReaction.get(result) || reactive(result)
  },
  set(target, key, value) {
    if (isObject(value)) value = reactionToRaw.get(value) || value

    const hasKey = Object.prototype.hasOwnProperty.call(target, key)
    const oldValue = target[key]
    const result = Reflect.set(target, key, value)

    if (isObject(oldValue) && isObject(value))
      rawToCallbackMap.set(
        target[key],
        rawToCallbackMap.get(oldValue) as CallbackMap
      )

    if (target.constructor.prototype[key] !== undefined)
      triggerCallback({ target, key, type: 'set' })
    else if (!hasKey) triggerCallback({ target, key, type: 'add' })
    else if (value !== oldValue && !isReactiveFunction(oldValue))
      triggerCallback({ target, key, type: 'set' })

    return result
  },
  deleteProperty(target, key) {
    const hasKey = Object.prototype.hasOwnProperty.call(target, key)
    const result = Reflect.deleteProperty(target, key)
    if (hasKey) triggerCallback({ target, key, type: 'delete' })
    return result
  },
  ownKeys(target) {
    parseSource({ target, key: __iterate__ })
    return Reflect.ownKeys(target)
  },
}

export function combine(source: Reaction, auxiliary: Reaction) {
  if (!isObject(source) || !isObject(auxiliary)) return source

  const raw = reactionToRaw.get(source) as object

  return new Proxy(
    {},
    {
      get(_, key: Key) {
        return auxiliary[key] === undefined ? source[key] : auxiliary[key]
      },
      set(_, key: Key, value: any) {
        return raw[key] === undefined
          ? Reflect.set(auxiliary, key, value)
          : Reflect.set(source, key, value)
      },
      ownKeys(_) {
        return Reflect.ownKeys(source)
      },
      getOwnPropertyDescriptor(_, key: Key) {
        return {
          configurable: true,
          enumerable: raw.constructor.prototype[key] === undefined,
        }
      },
    }
  )
}

/** assign value to reactive data without trigger global callback functions */
export function slientAssign(f: Function) {
  isPrototypeRunning = true
  f()
  isPrototypeRunning = false
}

export function triggerGlobal() {
  globalCallback.forEach(c => c())
}

export default new Map<Function, object>([
  [Array, baseHandlers],
  [Object, baseHandlers],
])
