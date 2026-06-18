'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { TextFieldProps } from '@mui/material/TextField'

import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'
import DebouncedInput from '@components/common/DebouncedInput'

interface LocalSearchbarProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  route: string
}

const LocalSearchbar = ({ route, ...props }: LocalSearchbarProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Use refs to avoid recreating callback when searchParams changes
  const searchParamsRef = useRef(searchParams)
  const pathnameRef = useRef(pathname)

  // Update refs when values change
  useEffect(() => {
    searchParamsRef.current = searchParams
    pathnameRef.current = pathname
  }, [searchParams, pathname])

  const query = searchParams.get('q')
  const [search, setSearch] = useState(query || '')

  // Sync search state with URL params (only when query actually changes)
  useEffect(() => {
    const currentQuery = searchParams.get('q') || ''

    if (currentQuery !== search) {
      setSearch(currentQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Stable callback that doesn't depend on searchParams directly
  const handleSearchChange = useCallback(
    (txt: string) => {
      const currentSearchParams = searchParamsRef.current
      const currentPathname = pathnameRef.current
      const currentQuery = currentSearchParams.get('q') || ''

      // Don't update if the value hasn't changed
      if (txt === currentQuery) {
        setSearch(txt)

        return
      }

      setSearch(txt)
      let newUrl = ''

      if (txt) {
        newUrl = formUrlQuery({
          params: currentSearchParams.toString(),
          key: 'q',
          value: txt,
          keysToRemove: ['page']
        })
      } else {
        if (currentPathname === route) {
          newUrl = removeKeysFromQuery({
            params: currentSearchParams.toString(),
            keysToRemove: ['q', 'page']
          })
        }
      }

      if (newUrl) {
        router.push(newUrl, { scroll: false })
      }
    },
    [router, route]
  )

  return <DebouncedInput {...props} value={search} onChange={handleSearchChange} size='small' />
}

export default LocalSearchbar
