import safeAccess from 'safe-access'

export const safe = safeAccess
// export const get = safe
export const assign = Object.assign
export const keys = obj => Object.keys(obj || {})
export const k = keys
export const values = obj => keys(obj).map(k => obj[k])
export const v = values
export const merge = (...objs) => Object.assign({}, ...objs)
export const m = merge
export const rollup = (arr, deriveValue, deriveKey) => {
  const defaultDeriveValue = () => true
  const defaultDeriveKey = item => ('' + item)
  let args = {}
  if (Array.isArray(arr)) {
    args.arr = arr
    args.deriveValue = deriveValue || defaultDeriveValue
    args.deriveKey = deriveKey || defaultDeriveKey
  } else if (typeof arr === 'object' && !!arr) {
    args.arr = arr.array
    args.deriveValue = arr.deriveValue || defaultDeriveValue
    args.deriveKey = arr.deriveKey || defaultDeriveKey
  }
  return args.arr.reduce(
    (obj, item) => merge(obj, { 
      [args.deriveKey(item)]: args.deriveValue(item) 
    }), {}
  )
}
export const rollupWithKey = (arr = [], deriveKey = () => null) => rollup(arr, item => item, deriveKey)
export const flattenArrs = arrs => arrs.reduce((flat, arr) => flat.concat(arr), [])
export const flattenDeep = arr => arr.reduce((f, i) => f.concat(Array.isArray(i) ? flattenDeep(i) : i), [])
export const valuesWithKey = obj => keys(obj).map(k => merge(obj[k], { _key: k }))
export const shallowClone = merge
export const arrayClone = arr => arr.slice(0)
export const kv = (obj, propMap = { k: 'k', v: 'v' }) => keys(obj).map(k => ({ [propMap['k']]: k, [propMap['v']]: obj[k] }))
export const asArray = obj => Object.keys(obj).map(k => ({ ...obj[k], _key: k }))
export const enforceArray = thing => isArr(thing) ? thing : [ thing ]
export const pairs = kv
export const kvr = kv => kv.reduce((o, { k, v }) => merge(o, { [k]: v }), {}) 
export const objMap = (obj, fn) => kv(obj).reduce((o, { k, v }) => merge(o, { [k]: fn(v, k) }), {})
export const objFilter = (obj, fn) => 
  kv(obj).reduce((o, { k, v }) => { if (!fn(k, v)) return o; return merge(o, { [k]: v }) }, {})
export const objKeyMap = (obj, fn) => kv(obj).reduce((o, { k, v }) => merge(o, { [fn(k, v)]: v }), {})
export const objForEach = objMap
export const doAsync = (fn, ms = 0) => new Promise(resolve => setTimeout(() => resolve(fn()), ms))
export const isArray = thing => Array.isArray(thing)
export const isArr = isArray
export const isString = thing => typeof thing === 'string'
export const isStr = isString
export const isNum = thing => typeof thing === 'number'
export const isFn = thing => typeof thing === 'function'
export const isBool = thing => typeof thing === 'boolean'
export const isObj = (...things) => things.every(thing => typeof thing === 'object' && !!thing && !isArr(isObj))
export const noop = () => undefined
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const wait = sleep
export const rand = (from = 0, to = 100) => Math.floor(Math.random() * (to)) + from
export const unique = (...arrs) => Array.from(new Set(arrs.reduce((c, a) => c.concat(a))))
export const arrayOf = (length = 0) => (new Array(length)).fill(true)
export const ellipsis = (str = '', maxLength) =>
  (str.length > maxLength) ? str.substring(0, maxLength).trim() + '...' : str
export const distinct = unique
export const timeout = (fn = () => null, ms = 0) => {
  if (typeof fn === 'number') {
    ms = fn
    fn = () => null
  }
  return new Promise(resolve => 
    setTimeout(async () => { await fn(); resolve() }, ms)
  )
}
  
export const findUndefined = obj => { 
  const undef = kv(obj).find(({ v }) => v === undefined)
  if (!undef) return null
  else return undef.k
}

export const ensure = (checkTrue, handleFail) => {
  if (!(checkTrue())) handleFail()
}

export const logAndThrow = ({ msg, dump }) => {
  console.log(`ERROR: ${msg}`, dump)
  throw new Error(msg)
}

export const ensureParamsProvided = params => {
  const paramNotProvided = findUndefined(params)
  if (paramNotProvided) throw new Error(`${paramNotProvided} not provided`)
}

export const compareByKeyValue = (obj1, obj2) => {
  if (obj1 === obj2) return true
  if (obj1 === null || obj2 === null) return false
  const k1 = k(obj1)
  const k2 = k(obj2)
  return (
    k1.length === k2.length
    && k1.every(k => obj1[k] === obj2[k])
  )
}

export const encodeForFbKey = str => {
  return str.replace(/\./g, '_x_dot_x_')
}

export const decodeFromFbKey = str => {
  return str.replace(/_x_dot_x_/g, '.')
}

export const thingsAreStrictlyEqual = (i1, i2) => {
  return i1 === i2
}

export const arraysHaveSameItems = (arr1, arr2, itemsAreEqual = thingsAreStrictlyEqual) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false
  if (arr1.length !== arr2.length) return false
  return arr1.every(i1 => arr2.some(i2 => itemsAreEqual(i1, i2)))
}

export const withProvisionMethod = obj => {
  const provision = createFunctionProvisioners(obj)
  return { ...obj, provision }
}

export const createFunctionProvisioners = (fns = {}) => (provisions = {}) =>
  objMap(fns, fn => (args = {}) => fn({ ...provisions, ...args }))

export const arraysAreSame = (arr1, arr2, itemsAreEqual = thingsAreStrictlyEqual) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false
  if (arr1.length !== arr2.length) return false
  for (let i = 0; i < arr1.length; i++)
    if (!itemsAreEqual(arr1[i],arr2[i])) return false
  return true
}

export const arrayComparator = 
  (itemsAreEqual = thingsAreStrictlyEqual) =>
  (arr1, arr2) => arraysAreSame(arr1, arr2, itemsAreEqual)

export const areShallowEquivalent = (thing1, thing2) => {
  if (typeof thing1 !== typeof thing2) return false
  if (Array.isArray(thing1) && !Array.isArray(thing2)) return false
  if (Array.isArray(thing2) && !Array.isArray(thing1)) return false
  if (Array.isArray(thing1)) return arraysAreSame(thing1, thing2)
  if (typeof thing1 === 'object') return compareByKeyValue(thing1, thing2)
  return thing1 === thing2
}

export const compareWithJSONStringify = (thing1, thing2) => {
  return JSON.stringify(thing1) === JSON.stringify(thing2)
}

export const sameRef = (fn, isEquivalent = areShallowEquivalent) => {
  let _cachedResult
  return (...args) => {
    
    const newResult = fn(...args)

    if (
      typeof _cachedResult === 'undefined' 
      || !isEquivalent(_cachedResult, newResult)
    ) { _cachedResult = newResult }

    return _cachedResult
  }
}

// same ref
export const sr = (checkSame = (v1, v2) => v1 === v2) => {
  let cached
  return val => {
    const isSame = checkSame(cached, val)
    if (!isSame) cached = val
    return cached
  }
}

export const createCallLimit = max => {
  let count
  return () => {
    if (count++ > max) return false
    return true
  }
}

export const createPropComparator = () => {
  let last = {}
  return next => {
    const allKeys = distinct([ ...k(last), ...k(next) ])
    const updatedProps = allKeys
      .filter(key => last[key] !== next[key])
      .map(key => ({ key, prev: last[key], next: next[key] }))
    last = next
    return updatedProps
  }
}

export class Emitter {
  constructor() { this.handlers = []; this.last = undefined }
  subscribe(handler) { this.handlers.push(handler) }
  unsubscribe(handler) { this.handlers = this.handlers.filter(h => h !== handler)}
  emit(result) { this.last = result; this.handlers.forEach(handler => handler(result)) }
}

export const trimStart = str => {
  if (str.trimStart) return str.trimStart()
  if (str.trimLeft) return str.trimLeft()
  const trimmed = str.trim()
	const startIndex = str.indexOf(trimmed)	
	return str.slice(startIndex, str.length)
}

export const throttle = (func, limit) => {
  let lastFunc
  let lastRan
  return function() {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

export const debounce = (func, delay) => {
  let inDebounce
  return function() {
    const context = this
    const args = arguments
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => func.apply(context, args), delay)
  }
}
