export const routerPrefix = (match) => {
  if (!match || !match.url) return ''
  let prefix = match.url
  if (prefix[prefix.length - 1] === '/') 
    prefix = prefix.substr(0, prefix.length - 1)
  return prefix
}

const relativeLocation = (location, prefix) =>
  location.pathname.substr(prefix.length)

const absoluteLocation = location => 
  location.pathname

const parseCurrentRoute = ({ match, location }) => {
  const prefix = routerPrefix(match)
  const absloc = absoluteLocation(location)
  const relloc = relativeLocation(location, prefix)
  const rellocArr = relloc.split('/').slice(1)
  return { prefix, relloc, rellocArr, absloc }
}

export const router = { 
  parseCurrentRoute, 
  routerPrefix, 
  relativeLocation 
}