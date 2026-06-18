'use client'

import React from 'react'

import { flexRender } from '@tanstack/react-table'
import classNames from 'classnames'
import { CircularProgress } from '@mui/material'

import type { ColumnDef } from '@tanstack/react-table'

import tableStyles from '@core/styles/table.module.css'
import CustomPagination from '@components/CustomPagination'
import { useDataTable } from '@/hooks/useDataTable'

interface DataTableProps<T> {
  data?: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  totalData?: number
  perPageCount?: number
  pageCount?: number
  hidePagination?: boolean
  customFilterKey?: string
  rowSelection?: any
  onRowSelectionChange?: any
}

function DataTable<T>({
  data = [],
  columns,
  loading = false,
  totalData,
  perPageCount = 10,
  pageCount = 0,
  hidePagination = false,
  customFilterKey,
  rowSelection,
  onRowSelectionChange
}: DataTableProps<T>) {
  const { table } = useDataTable({
    data: data,
    columns,
    pagination: {
      pageSize: perPageCount,
      pageIndex: pageCount + 1
    },
    rowSelection,
    onRowSelectionChange
  })

  return (
    <>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
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
          ) : table.getFilteredRowModel().rows.length === 0 ? (
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
                .map(row => (
                  <tr key={row.id} className={classNames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          )}
        </table>
      </div>
      {!hidePagination && (
        <CustomPagination
          length={+totalData!}
          page={+pageCount}
          perPage={+perPageCount}
          customFilterKey={customFilterKey}
        />
      )}
    </>
  )
}

export default DataTable
