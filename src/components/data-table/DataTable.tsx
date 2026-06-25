'use client'

import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { flexRender } from '@tanstack/react-table'
import classNames from 'classnames'
import Button from '@mui/material/Button'
import { CircularProgress } from '@mui/material'

import type { ColumnDef } from '@tanstack/react-table'

import tableStyles from '@core/styles/table.module.css'
import CustomPagination from '@components/CustomPagination'
import { useDataTable } from '@/hooks/useDataTable'

interface DataTableProps<T> {
  loading?: boolean
  table?: any
  data?: T[]
  columns?: ColumnDef<T>[]
  totalData?: number
  paginationData?: {
    totalData: number
    totalPages: number
    currentPage: number
  }
  pageCount?: number
  perPageCount?: number
  paginationShow?: boolean
  hidePagination?: boolean
  onRowClick?: (row: T) => void
  sortingEnabled?: boolean
  sorting?: any
  onSortingChange?: any
  sortingQueryEnabled?: boolean
  sortableFields?: string[]
  sortable_fields?: string[]
  sortByParam?: string
  sortOrderParam?: string
  pageParam?: string
  customFilterKey?: string
  rowSelection?: any
  onRowSelectionChange?: any
}

const SortableHeaderCell = ({ header }: { header: any }) => {
  const sorted = header.column.getIsSorted()

  return (
    <Button
      type='button'
      variant='text'
      color='inherit'
      className='!min-h-0 !px-1 !py-0.5 font-[inherit] text-[inherit] normal-case inline-flex items-center gap-1'
      onClick={header.column.getToggleSortingHandler()}
    >
      <span className='inline-flex items-center'>
        {flexRender(header.column.columnDef.header, header.getContext())}
      </span>
      {sorted === 'asc' ? (
        <i className='ri-arrow-up-s-line text-[1rem] shrink-0' />
      ) : sorted === 'desc' ? (
        <i className='ri-arrow-down-s-line text-[1rem] shrink-0' />
      ) : (
        <i className='ri-expand-up-down-line text-[1rem] shrink-0 opacity-40' />
      )}
    </Button>
  )
}

const DataTableComponent = <T,>(
  {
    loading = false,
    table: propsTable,
    data,
    columns,
    totalData,
    paginationData,
    pageCount = 0,
    perPageCount = 10,
    paginationShow = true,
    hidePagination = false,
    onRowClick,
    sortingEnabled = false,
    sorting,
    onSortingChange,
    sortingQueryEnabled = false,
    sortableFields = [],
    sortable_fields,
    sortByParam = 'sort_field',
    sortOrderParam = 'sort_dir',
    pageParam = 'page',
    customFilterKey,
    rowSelection,
    onRowSelectionChange
  }: DataTableProps<T>,
  ref: React.Ref<any>
) => {
  const innerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const resolvedSortableFields = sortable_fields || sortableFields || []
  const sortableFieldSet = useMemo(() => new Set(resolvedSortableFields), [resolvedSortableFields])
  const hasSortableFieldFilter = resolvedSortableFields.length > 0
  const sortBy = searchParams?.get(sortByParam) || ''
  const sortOrder = searchParams?.get(sortOrderParam) || ''

  const urlSorting = useMemo(() => {
    if (!sortingQueryEnabled || !sortBy || !sortableFieldSet.has(sortBy)) return []

    return [{ id: sortBy, desc: sortOrder === 'desc' }]
  }, [sortingQueryEnabled, sortBy, sortOrder, sortableFieldSet])

  const resolvedSorting = sortingQueryEnabled ? urlSorting : sorting

  const handleSortingChange = (updater: any) => {
    const currentSorting = resolvedSorting ?? []
    const nextSorting = typeof updater === 'function' ? updater(currentSorting) : updater
    const nextSort = nextSorting?.[0]

    if (sortingQueryEnabled) {
      const nextQueryParams = new URLSearchParams(searchParams.toString())

      if (!nextSort?.id || (sortableFieldSet.size > 0 && !sortableFieldSet.has(nextSort.id))) {
        nextQueryParams.delete(sortByParam)
        nextQueryParams.delete(sortOrderParam)
        nextQueryParams.delete(pageParam)

        const nextUrl = `${pathname}${nextQueryParams.toString() ? `?${nextQueryParams.toString()}` : ''}`

        router.push(nextUrl)
      } else {
        nextQueryParams.set(sortByParam, nextSort.id)
        nextQueryParams.set(sortOrderParam, nextSort?.desc ? 'desc' : 'asc')
        nextQueryParams.delete(pageParam)

        const nextUrl = `${pathname}${nextQueryParams.toString() ? `?${nextQueryParams.toString()}` : ''}`

        router.push(nextUrl)
      }
    }

    onSortingChange?.(updater)
  }

  const internalSortingConfig = sortingEnabled
    ? {
        manualSorting: true,
        ...(resolvedSorting !== undefined ? { state: { sorting: resolvedSorting } } : {}),
        ...(sortingQueryEnabled || onSortingChange ? { onSortingChange: handleSortingChange } : {})
      }
    : {}

  const { table: internalTable } = useDataTable<T>({
    data: data || [],
    columns: columns || [],
    pagination: {
      pageSize: perPageCount,
      pageIndex: pageCount + 1
    },
    rowSelection,
    onRowSelectionChange,
    ...internalSortingConfig
  })

  const table = data && columns ? internalTable : propsTable || internalTable

  useImperativeHandle(ref, () => {
    const element = innerRef.current as any

    if (element) {
      element.table = table
    }

    
return element
  })

  const resolvedPaginationShow = hidePagination ? false : paginationShow
  const resolvedTotalLength = totalData !== undefined ? totalData : paginationData?.totalData || 0

  return (
    <>
      <div ref={innerRef} className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => {
                  const isAllowedBySortableFields = !hasSortableFieldFilter || sortableFieldSet.has(header.column.id)

                  const showSort =
                    sortingEnabled &&
                    isAllowedBySortableFields &&
                    header.column.getCanSort() &&
                    !(header.column.columnDef.meta as any)?.disableSortButton

                  return (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : showSort ? (
                        <SortableHeaderCell header={header} />
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  <CircularProgress />
                </td>
              </tr>
            </tbody>
          ) : table.getRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map((row: any) => (
                  <tr
                    key={row.id}
                    className={classNames({ selected: row.getIsSelected() })}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          )}
          {table
            .getFooterGroups()
            .some((footerGroup: any) =>
              footerGroup.headers.some((header: any) => !header.isPlaceholder && header.column.columnDef.footer)
            ) && (
            <tfoot>
              {table.getFooterGroups().map((footerGroup: any) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header: any) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
      {resolvedPaginationShow && (
        <CustomPagination
          length={+resolvedTotalLength}
          page={+pageCount}
          perPage={+perPageCount}
          customFilterKey={customFilterKey}
        />
      )}
    </>
  )
}

const DataTable = forwardRef(DataTableComponent) as <T>(
  props: DataTableProps<T> & { ref?: React.Ref<any> }
) => React.ReactElement

export default DataTable
