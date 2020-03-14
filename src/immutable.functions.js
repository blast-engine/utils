import safe from 'safe-access'

const DELETE_FLAG = '__*delete*__'

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

const _setAtPath = (object = {}, path = 'example.path', value) => { 
  return _setAtPathInternal(object, path.split('.'), value)
}

const _applyTransitionMap = (state, transitionMap) => {
  return Object.keys(transitionMap)
    .reduce((nextStateInConstruction, path) => {
      const prevSubState = safe(state, path)
      const nextSubState = typeof transitionMap[path] === 'function'
        ? transitionMap[path](prevSubState, state)
        : transitionMap[path]
      return _setAtPath(nextStateInConstruction, path, nextSubState)
    }, state)

}

export const get = (obj, path) => safe(obj, path)
export const set = (obj, transitionMap) => _applyTransitionMap(obj, transitionMap)
export const unset = (obj, paths) => {
  const pathsArray = Array.isArray(paths) ? paths : [paths]
  const transitionMap = pathsArray.reduce((tm, p) => ({ [p]: DELETE_FLAG, ...tm }), {})
  return set(obj, transitionMap)
}

export const g = get
export const s = set
export const u = unset
