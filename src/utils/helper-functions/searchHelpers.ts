export const formUrlQuery = ({
  params,
  key,
  value,
  keysToRemove = []
}: {
  params: string
  key: string | string[]
  value: string
  keysToRemove?: string[]
}) => {
  const urlParams = new URLSearchParams(params)
  const keys = Array.isArray(key) ? key : [key]

  keys.forEach(k => {
    urlParams.set(k, value)
  })

  keysToRemove.forEach(keyToRemove => {
    urlParams.delete(keyToRemove)
  })

  return `${window.location.pathname}?${urlParams.toString()}`
}

export const removeKeysFromQuery = ({ params, keysToRemove }: { params: string; keysToRemove: string[] }) => {
  const urlParams = new URLSearchParams(params)

  keysToRemove.forEach(key => {
    urlParams.delete(key)
  })

  const queryStr = urlParams.toString()

  
return `${window.location.pathname}${queryStr ? '?' + queryStr : ''}`
}
