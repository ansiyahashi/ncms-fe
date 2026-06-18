'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { TablePagination } from '@mui/material'

import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'

interface CustomPaginationProps {
  length: number
  page?: number
  perPage?: number
  customFilterKey?: string
}

const CustomPagination = ({ length, page = 0, perPage = 10, customFilterKey }: CustomPaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleNavigation = useCallback(
    (_: any, newPage: number) => {
      let newUrl = ''
      const pageKey = customFilterKey ? customFilterKey + 'page' : 'page'

      if (newPage < 1) {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: [pageKey]
        })
      } else {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: pageKey,
          value: newPage.toString()
        })
      }

      router.push(newUrl)
    },
    [router, searchParams, customFilterKey]
  )

  const handleRowsCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const perPageKey = customFilterKey ? customFilterKey + 'per-page' : 'per-page'

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: perPageKey,
        value: e.target.value.toString()
      })

      const url = new URL(newUrl, window.location.origin)
      const pageKey = customFilterKey ? customFilterKey + 'page' : 'page'

      url.searchParams.delete(pageKey)
      router.push(url.toString())
    },
    [router, searchParams, customFilterKey]
  )

  if (!isMounted) return null

  return (
    <TablePagination
      rowsPerPageOptions={[10, 25, 50, 100]}
      component='div'
      className='border-bs'
      count={length || 0}
      rowsPerPage={perPage || 10}
      page={page}
      slotProps={{
        select: { inputProps: { 'aria-label': 'rows per page' } }
      }}
      onPageChange={handleNavigation}
      onRowsPerPageChange={handleRowsCountChange}
      showFirstButton
      showLastButton
    />
  )
}

export default CustomPagination
