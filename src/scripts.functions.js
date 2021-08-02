export const runScript = async script => {
  let g
  if (typeof window === 'object') g = window
  else if (typeof window === 'object') g = global
  await script(g)
  console.log('done :)')
}