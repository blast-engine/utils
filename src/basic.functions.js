import safeAccess from 'safe-access'

export const safe = safeAccess
export const get = safe
export const g = get
export const assign = Object.assign
export const keys = obj => Object.keys(obj || {})
export const k = keys
export const values = obj => keys(obj).map(k => obj[k])
export const v = values
export const merge = (...objs) => Object.assign({}, ...objs)
export const m = merge
export const rollup = (arr, deriveValue = () => true) => arr.reduce((obj, str) => merge(obj, { [str]: deriveValue(str) }), {})
export const flattenArrs = arrs => arrs.reduce((flat, arr) => flat.concat(arr), [])
export const valuesWithKey = obj => keys(obj).map(k => merge(obj[k], { _key: k }))
export const shallowClone = merge
export const arrayClone = arr => arr.slice(0)
export const kv = obj => keys(obj).map(k => ({ k, v: obj[k] }))
export const asArray = obj => Object.keys(obj).map(k => ({ ...obj[k], _key: k }))
export const pairs = kv
export const kvr = kv => kv.reduce((o, { k, v }) => merge(o, { [k]: v }), {}) 
export const objMap = (obj, fn) => kv(obj).reduce((o, { k, v }) => merge(o, { [k]: fn(v, k) }), {})
export const objForEach = objMap
export const doAsync = (fn, ms = 0) => new Promise(resolve => setTimeout(() => resolve(fn()), ms))
export const isArray = thing => Array.isArray(thing)
export const isString = thing => typeof thing === 'string'
export const noop = () => undefined
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const wait = sleep
export const rand = (from = 0, to = 100) => Math.floor(Math.random() * (to)) + from
export const unique = (...arrs) => Array.from(new Set(arrs.reduce((c, a) => c.concat(a))))
export const arrayOf = (length = 0) => (new Array(length)).fill(true)
export const ellipsis = (str = '', maxLength) =>
  (str.length > maxLength) ? str.substring(0, maxLength).trim() + '...' : str
export const distinct = unique
export const timeout = (fn = () => null, ms = 0) => 
  new Promise(resolve => setTimeout(async () => { await fn(); resolve() }, ms))

export const compareByKeyValue = (obj1, obj2) => {
  if (obj1 === null && obj2 !== null) return false
  if (obj2 === null && obj1 !== null) return false
  const k1 = k(obj1)
  const k2 = k(obj2)
  return (
    k1.length === k2.length
    && k1.every(k => obj1[k] === obj2[k])
  )
}

export const arraysAreSame = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false
  for (let i = 0; i < arr1.length; i++)
    if (arr1[i] !== arr2[i]) return false
  return true
}

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

export class Emitter {
  constructor() { this.handlers = [] }
  subscribe(handler) { this.handlers.push(handler) }
  unsubscribe(handler) { this.handlers = this.handlers.filter(h => h !== handler)}
  emit(result) { this.handlers.forEach(handler => handler(result)) }
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