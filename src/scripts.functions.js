export const runScript = async script => {
  let g
  if (typeof window === 'object') g = window
  else if (typeof window === 'object') g = global
  await script(g)
  console.log('done')
}

export const runScriptAndKeepAlive = async (script = async () => null) => {
  await runScript(script)
  setInterval(() => null, 20000)
}