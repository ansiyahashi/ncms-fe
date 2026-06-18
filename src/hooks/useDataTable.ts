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
  rowSelection: externalRowSelection,
  onRowSelectionChange: onExternalRowSelectionChange,
  ...props
}: Omit<TableOptions<T>, 'getCoreRowModel'> & {
  data: T[]
  columns: ColumnDef<T>[]
  pagination?: { pageSize: number; pageIndex: number }
  rowSelection?: any
  onRowSelectionChange?: any
}) {
  const [internalRowSelection, setInternalRowSelection] = useState({})

  const rowSelection = externalRowSelection !== undefined ? externalRowSelection : internalRowSelection

  const onRowSelectionChange =
    onExternalRowSelectionChange !== undefined ? onExternalRowSelectionChange : setInternalRowSelection

  const table = useReactTable({
    ...props,
    filterFns: {
      fuzzy: simpleFilter as any
    },
    state: {
      rowSelection,
      pagination
    },
    manualPagination: true,
    enableRowSelection: true,
    globalFilterFn: simpleFilter as any,
    onRowSelectionChange: onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    defaultColumn: {
      maxSize: 100
    }
  })

  return { table }
}
