'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { IconButton, Chip, Switch, FormControl, InputLabel, Select, MenuItem, Box, Grid } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import LocalSearchbar from '@components/common/LocalSearchbar'
import DataTable from '@components/data-table/DataTable'
import RoleGuard from '@components/RoleGuard'
import { addOrUpdateItem } from '@/utils/helper-functions/addOrUpdateItem'
import { getAvatarColor } from '@/utils/helper-functions/getAvatarColor'
import { formUrlQuery, removeKeysFromQuery } from '@/utils/helper-functions/searchHelpers'
import { validateError } from '@/api'
import { PERMISSIONS } from '@/libs/paths'

import { deleteClient, updateClientStatus } from '../api/client.action'
import ClientFormDialog from './ClientFormDialog'

const columnHelper = createColumnHelper<any>()

interface ClientsTableProps {
  initialData: any[]
  initialPagination: {
    totalData: number
    totalPages: number
    currentPage: number
  }
  perPageCount: number
  pageCount: number
  loading: boolean
  businessesData?: any[]
}

const ClientsTable = ({
  initialData,
  initialPagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = []
}: ClientsTableProps) => {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.is_super_admin
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [data, setData] = useState(initialData)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [openDialog, setOpenDialog] = useState(false)

  const currentBId = searchParams.get('b_id') || ''

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Count Stats
  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter(c => c.status).length
    const inactive = total - active

    
return { total, active, inactive }
  }, [data])

  const handleBusinessChange = useCallback((bId: string) => {
    let newUrl = ''

    if (bId) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'b_id',
        value: bId,
        keysToRemove: ['page']
      })
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['b_id', 'page']
      })
    }

    router.push(newUrl, { scroll: false })
  }, [searchParams, router])

  const onDeleteClient = useCallback(async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this Client?')) return

    try {
      const { data: responseData, errors } = await deleteClient({ id: clientId }, pathname)

      if (responseData?.deleteClient) {
        toast.success('Client deleted successfully!')
        setData(prev => prev.filter(c => c?.id !== responseData?.deleteClient?.id))
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete the client.')
    }
  }, [pathname])

  const handleStatusChange = useCallback(async (client: any) => {
    const updatedStatus = !client?.status

    try {
      const { data: responseData, errors } = await updateClientStatus(client?.id, updatedStatus, pathname)

      if (responseData?.updateClientStatus) {
        toast.success(`Status updated for ${client?.name || 'N/A'}`)
        addOrUpdateItem(setData, { ...client, status: updatedStatus }, 'id')
      }

      validateError(errors)
    } catch (error: any) {
      toast.error(error?.message || `Failed to update status for ${client?.name || 'N/A'}`)
    }
  }, [pathname])

  const onEditItem = useCallback((item: any) => {
    setSelectedItem(item)
    setOpenDialog(true)
  }, [])

  const onDataChange = useCallback((updatedItem: any) => {
    addOrUpdateItem(setData, updatedItem, 'id')
  }, [])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => {
          const name = row?.original?.name || ''
          const firstLetter = name.charAt(0).toUpperCase()
          const colorClass = getAvatarColor(name)

          return (
            <div className='flex items-center gap-3'>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${colorClass}`}>
                {firstLetter}
              </div>
              <Typography color='text.primary' className='font-semibold text-[13px]'>
                {name}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('code', {
        header: 'Code',
        cell: ({ row }) => (
          <Typography color='text.secondary' className='font-mono text-xs bg-actionHover px-2 py-0.5 rounded border border-divider inline-block'>
            {row?.original?.code || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('contact_person', {
        header: 'Contact Details',
        cell: ({ row }) => (
          <div className='flex flex-col gap-0.5'>
            <Typography className='text-xs font-semibold text-textPrimary'>
              {row?.original?.contact_person || '-'}
            </Typography>
            {row?.original?.email && (
              <Typography className='text-[10px] text-textSecondary flex items-center gap-1'>
                <i className='ri-mail-line' /> {row?.original?.email}
              </Typography>
            )}
            {row?.original?.phone && (
              <Typography className='text-[10px] text-textSecondary flex items-center gap-1'>
                <i className='ri-phone-line' /> {row?.original?.phone}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('vat_trn_no', {
        header: 'Tax & License',
        cell: ({ row }) => (
          <div className='flex flex-col gap-0.5'>
            {row?.original?.vat_trn_no && (
              <Typography className='text-[11px] text-textPrimary font-mono'>
                TRN: {row?.original?.vat_trn_no}
              </Typography>
            )}
            {row?.original?.trade_licence_no && (
              <Typography className='text-[10px] text-textSecondary font-mono'>
                Lic: {row?.original?.trade_licence_no}
              </Typography>
            )}
            {!row?.original?.vat_trn_no && !row?.original?.trade_licence_no && (
              <Typography color='text.secondary' className='text-xs'>-</Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row?.original?.status ? 'Active' : 'Inactive'}
              size='small'
              color={row?.original?.status ? 'success' : 'warning'}
            />
            <Switch
              checked={row?.original?.status}
              onChange={() => handleStatusChange(row?.original)}
              inputProps={{ 'aria-label': 'status-toggle' }}
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <RoleGuard allowedPermissions={[PERMISSIONS.CLIENT_EDIT]}>
              <IconButton size='small' onClick={() => onEditItem(row?.original)} color='secondary'>
                <i className='ri-edit-box-line text-textSecondary text-[18px]' />
              </IconButton>
            </RoleGuard>
            <RoleGuard allowedPermissions={[PERMISSIONS.CLIENT_DELETE]}>
              <IconButton size='small' onClick={() => onDeleteClient(row?.original?.id)} color='error'>
                <i className='ri-delete-bin-7-line text-textSecondary text-[18px]' />
              </IconButton>
            </RoleGuard>
          </div>
        ),
        enableSorting: false
      })
    ],
    [onDeleteClient, handleStatusChange, onEditItem]
  )

  return (
    <Box className='flex flex-col gap-6 w-full'>
      {/* Title Header */}
      <Box className='flex flex-col gap-1'>
        <Typography variant='h4' className='font-bold tracking-tight text-textPrimary'>
          Clients Directory
        </Typography>
        <Typography variant='body2' className='text-textSecondary'>
          Manage client profiles, key accounts, and legal registrations. Setup billing and billing codes to manage invoicing contexts.
        </Typography>
      </Box>

      {/* Modern Stats summary */}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='border border-divider shadow-sm rounded-xl overflow-hidden bg-gradient-to-r from-primary/10 via-backgroundPaper to-backgroundPaper relative'>
            <Box className='absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none' />
            <CardContent className='p-5 flex items-center justify-between'>
              <Box className='flex flex-col gap-1'>
                <Typography className='text-textSecondary font-semibold text-xs uppercase tracking-wider'>Total Clients</Typography>
                <Typography variant='h3' className='font-bold text-textPrimary'>{stats.total}</Typography>
              </Box>
              <Box className='w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-xs'>
                <i className='ri-briefcase-line text-2xl' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='border border-divider shadow-sm rounded-xl overflow-hidden bg-gradient-to-r from-success/10 via-backgroundPaper to-backgroundPaper relative'>
            <Box className='absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-2xl pointer-events-none' />
            <CardContent className='p-5 flex items-center justify-between'>
              <Box className='flex flex-col gap-1'>
                <Typography className='text-textSecondary font-semibold text-xs uppercase tracking-wider'>Active Clients</Typography>
                <Typography variant='h3' className='font-bold text-textPrimary'>{stats.active}</Typography>
              </Box>
              <Box className='w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center border border-success/20 shrink-0 shadow-xs'>
                <i className='ri-checkbox-circle-line text-2xl' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='border border-divider shadow-sm rounded-xl overflow-hidden bg-gradient-to-r from-warning/10 via-backgroundPaper to-backgroundPaper relative'>
            <Box className='absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-2xl pointer-events-none' />
            <CardContent className='p-5 flex items-center justify-between'>
              <Box className='flex flex-col gap-1'>
                <Typography className='text-textSecondary font-semibold text-xs uppercase tracking-wider'>Inactive Clients</Typography>
                <Typography variant='h3' className='font-bold text-textPrimary'>{stats.inactive}</Typography>
              </Box>
              <Box className='w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center border border-warning/20 shrink-0 shadow-xs'>
                <i className='ri-error-warning-line text-2xl' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table view */}
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <div className='flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:is-full'>
            <LocalSearchbar route={'/organization/client'} placeholder='Search Clients' className='max-sm:is-full sm:min-is-[220px]' />
            
            {isSuperAdmin && (
              <FormControl size='small' className='max-sm:is-full' sx={{ minWidth: 180 }}>
                <InputLabel id='business-filter-select-label'>Business</InputLabel>
                <Select
                  labelId='business-filter-select-label'
                  id='business-filter-select'
                  value={currentBId}
                  label='Business'
                  onChange={e => handleBusinessChange(e.target.value as string)}
                >
                  <MenuItem value=''>All Businesses</MenuItem>
                  {businessesData.map((business: any) => (
                    <MenuItem key={business.id} value={business.id}>
                      {business.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>

          <RoleGuard allowedPermissions={[PERMISSIONS.CLIENT_CREATE]}>
            <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
              <Button
                variant='contained'
                color='primary'
                className='max-sm:is-full'
                startIcon={<i className='ri-add-line' />}
                onClick={() => {
                  setSelectedItem(null)
                  setOpenDialog(true)
                }}
              >
                Add Client
              </Button>
            </div>
          </RoleGuard>
        </CardContent>
        <DataTable
          data={data}
          columns={columns}
          totalData={initialPagination?.totalData}
          pageCount={pageCount}
          perPageCount={perPageCount}
          loading={loading}
        />
      </Card>

      <ClientFormDialog
        open={openDialog}
        setOpen={setOpenDialog}
        details={selectedItem}
        onDataChange={onDataChange}
        businessesData={businessesData}
        currentBId={currentBId}
        isSuperAdmin={isSuperAdmin}
      />
    </Box>
  )
}

export default ClientsTable
