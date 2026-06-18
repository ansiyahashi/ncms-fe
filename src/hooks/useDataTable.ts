'use client'

import { useState } from 'react'

import {
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type TableOptions
} from '@tanstack/react-table'

const simpleFilter = (row: any, columnId: string, value: any) => {
  const cellValue = row.getValue(columnId)

  if (cellValue == null) return false

  return String(cellValue).toLowerCase().includes(String(value).toLowerCase())
}

export function useDataTable<T>({
  pagination = {
    pageSize: 10,
    pageIndex: 1
  },
  manualPagination = true,
  manualSorting = false,
  manualFiltering = false,
  rowSelection: externalRowSelection,
  onRowSelectionChange: onExternalRowSelectionChange,
  ...props
}: Omit<TableOptions<T>, 'getCoreRowModel'> & {
  data: T[]
  columns: ColumnDef<T>[]
  pagination?: { pageSize: number; pageIndex: number }
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  rowSelection?: any
  onRowSelectionChange?: any
}) {
  const [internalRowSelection, setInternalRowSelection] = useState({})

  const rowSelection = externalRowSelection !== undefined ? externalRowSelection : internalRowSelection

  const onRowSelectionChange =
    onExternalRowSelectionChange !== undefined ? onExternalRowSelectionChange : setInternalRowSelection

  const table = useReactTable({
    filterFns: {
      fuzzy: simpleFilter as any
    },
    manualPagination,
    manualSorting,
    manualFiltering,
    enableRowSelection: true,
    globalFilterFn: simpleFilter as any,
    onRowSelectionChange: onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    defaultColumn: {
      maxSize: 100
    },
    ...props,
    state: {
      rowSelection,
      ...props?.state,
      pagination
    }
  })

  return { table }
}
