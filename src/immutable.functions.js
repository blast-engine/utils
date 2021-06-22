import safe from 'safe-access'
import * as b from './basic.functions'

const DELETE_FLAG = '__*delete*__'

export const PATH_DELIMITER_REGEX = /\.|\//
export const DEFAULT_PATH_DELIMITER = '/'

export const pathToArray = path => {
  if (b.isArr(path)) return path
  return path.split(PATH_DELIMITER_REGEX)
}

export const pathToString = (path, delimiter = DEFAULT_PATH_DELIMITER) => {
  if (b.isStr(path)) return path
  return path.join(delimiter)
}

export const setStrPathDelimiter = (path, delimiter = DEFAULT_PATH_DELIMITER) => {
  return pathToString(pathToArray(path), delimiter)
}

const _setAtPathInternal = (object = {}, pathArray = [], value) => {
  if (!pathArray.length)
    throw new Error('INVALID PATH ARRAY')
  else if (pathArray.length === 1) {
    const clone = { ...object }
    if (value === DELETE_FLAG) delete clone[pathArray[0]] 
    else clone[pathArray[0]] = value
    return clone
  }
  else
    return { 
      ...object, 
      [pathArray[0]]: _setAtPathInternal(object[pathArray[0]], pathArray.slice(1), value) 
    }
}

const _setAtPath = (object = {}, path = '', value) => { 
  return _setAtPathInternal(object, pathToArray(path), value)
}

const _applyTransitionMap = (state, _transitionMap) => {
  const transitionMap = b.objKeyMap(_transitionMap, path => setStrPathDelimiter(path, '.'))
  return b.keys(transitionMap)
    .reduce((nextStateInConstruction, path) => {
      const prevSubState = safe(state, path)
      const nextSubState = typeof transitionMap[path] === 'function'
        ? transitionMap[path](prevSubState, state)
        : transitionMap[path]
      return _setAtPath(nextStateInConstruction, path, nextSubState)
    }, state)

}

export const get = (obj = {}, path) => safe(obj, setStrPathDelimiter(path, '.'))
export const set = (obj = {}, transitionMap) => _applyTransitionMap(obj, transitionMap)
export const unset = (obj = {}, paths) => {
  const pathsArray = Array.isArray(paths) ? paths : [paths]
  const transitionMap = pathsArray.reduce((tm, p) => ({ [p]: DELETE_FLAG, ...tm }), {})
  return set(obj, transitionMap)
}

export class ImmutableReadOnly {
  constructor(raw) {
    this._raw = raw
  }

  static wrap(raw) {
    return new this(raw)
  }

  wrap(raw) {
    return this.constructor.wrap(raw)
  }

  raw() {
    return this._raw
  }

  get(...args) {
    return this._get(...args)
  }

  _get(path) {
    if (!path) return this._raw
    return g(this._raw, path)
  }
}

export class Immutable extends ImmutableReadOnly {
  set(...args) {
    return this._set(...args)
  }

  _set(transitionMapOrPath, valueOrNothing) {
    let transitionMap
    if (typeof transitionMapOrPath === 'object') 
      transitionMap = transitionMapOrPath
    else if (typeof transitionMapOrPath === 'string') 
      transitionMap = { [transitionMapOrPath]: valueOrNothing }

    return this.wrap(s(this._get(), transitionMap))
  }
}


export const g = get
export const s = set
export const u = unset
