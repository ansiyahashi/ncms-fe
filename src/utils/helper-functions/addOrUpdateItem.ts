export const addOrUpdateItem = <T extends { [key: string]: any }>(
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  newItem: T,
  key: string = 'id'
) => {
  setState(prevState => {
    const existingIndex = prevState.findIndex(item => item[key] === newItem[key])

    if (existingIndex !== -1) {
      // Update existing item
      const updatedState = [...prevState]

      updatedState[existingIndex] = { ...updatedState[existingIndex], ...newItem }

      return updatedState
    }

    // Add new item
    return [newItem, ...prevState]
  })
}
