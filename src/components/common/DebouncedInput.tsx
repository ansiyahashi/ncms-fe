'use client'

import { useEffect, useState, useRef } from 'react'

import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'

interface DebouncedInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  debounce?: number
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }: DebouncedInputProps) => {
  const [value, setValue] = useState(initialValue)
  const onChangeRef = useRef(onChange)
  const isInitialMount = useRef(true)
  const isUserInputRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Sync value with prop (only when prop changes externally, not from user input)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false

      return
    }

    // Only sync if the change came from outside (not from user typing)
    if (!isUserInputRef.current && initialValue !== value) {
      setValue(initialValue)
    }

    // Reset the flag after syncing
    isUserInputRef.current = false
  }, [initialValue, value])

  // Handle user input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    setValue(newValue)
    isUserInputRef.current = true

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced onChange
    timeoutRef.current = setTimeout(() => {
      onChangeRef.current(newValue)
      isUserInputRef.current = false
    }, debounce)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return <TextField {...props} value={value} onChange={handleChange} size='small' />
}

export default DebouncedInput
