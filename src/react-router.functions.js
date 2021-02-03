export const routerPrefix = (match) => {
  if (!match || !match.url) return ''
  let prefix = match.url
  if (prefix[prefix.length - 1] === '/') 
    prefix = prefix.substr(0, prefix.length - 1)
  return prefix
}

const relativeLocation = (location, prefix) =>
  location.pathname.substr(prefix.length)

const parseCurrentRoute = ({ match, location }) => {
  const prefix = routerPrefix(match)
  const relloc = relativeLocation(location, prefix)
  const rellocArr = relloc.split('/').slice(1)
  return { prefix, relloc, rellocArr }
}

export const router = { 
  parseCurrentRoute, 
  routerPrefix, 
  relativeLocation 
}