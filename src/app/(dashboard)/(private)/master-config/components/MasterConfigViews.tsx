'use client'

import { useState, type SyntheticEvent } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

import CostCentersList from './CostCentersList'
import UserTypesList from './UserTypesList'
import OwnerTypesList from './OwnerTypesList'
import FacilityTypesList from './FacilityTypesList'
import AssetStatusesList from './AssetStatusesList'
import DepartmentsList from './DepartmentsList'
import DesignationsList from './DesignationsList'

interface MasterConfigViewsProps {
  activeView: string
  viewData: any[]
  pagination: {
    totalData: number
    totalPages: number
    currentPage: number
  }
  perPageCount: number
  pageCount: number
  loading: boolean
  businessesData?: any[]
  departmentsData?: any[]
  isSuperAdmin?: boolean
}

const CONFIG_METADATA: Record<
  string,
  { title: string; description: string; icon: string; colorClass: string; bannerGradient: string }
> = {
  'cost-centers': {
    title: 'Cost Centers',
    description: 'Manage financial tracking codes and department budgets. Assign cost centers to facilities and track resource allocation across operations.',
    icon: 'ri-money-dollar-circle-line',
    colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    bannerGradient: 'from-amber-500/10 via-backgroundPaper to-backgroundPaper'
  },
  'user-types': {
    title: 'User Types',
    description: 'Define roles, access structures, and user classifications. Group users to simplify permissions, onboarding, and task assignments.',
    icon: 'ri-user-settings-line',
    colorClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    bannerGradient: 'from-indigo-500/10 via-backgroundPaper to-backgroundPaper'
  },
  'owner-types': {
    title: 'Owner Types',
    description: 'Configure asset ownership categories. Distinguish corporate-owned, leased, or contracted properties to structure liability and maintenance contracts.',
    icon: 'ri-key-2-line',
    colorClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    bannerGradient: 'from-purple-500/10 via-backgroundPaper to-backgroundPaper'
  },
  'facility-types': {
    title: 'Facility Types',
    description: 'Categorize your physical assets and locations. Define buildings, offices, and external sites to filter reports and service tickets.',
    icon: 'ri-building-4-line',
    colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    bannerGradient: 'from-emerald-500/10 via-backgroundPaper to-backgroundPaper'
  },
  'asset-statuses': {
    title: 'Asset Statuses',
    description: 'Maintain status codes to track asset health. These statuses (e.g. Active, Maintenance, Retired) govern maintenance scheduling and reporting.',
    icon: 'ri-checkbox-circle-line',
    colorClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    bannerGradient: 'from-rose-500/10 via-backgroundPaper to-backgroundPaper'
  },
  'departments': {
    title: 'Departments',
    description: 'Structure your organizational layout. Define workgroups (e.g. Facilities, Security, Finance) to route service tickets and group staff.',
    icon: 'ri-community-line',
    colorClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    bannerGradient: 'from-teal-500/10 via-backgroundPaper to-backgroundPaper'
  },
  'designations': {
    title: 'Designations',
    description: 'Configure corporate rank and title systems. Assign clear titles to staff to organize access hierarchy, duties, and escalations.',
    icon: 'ri-briefcase-line',
    colorClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    bannerGradient: 'from-sky-500/10 via-backgroundPaper to-backgroundPaper'
  }
}

const MasterConfigViews = ({
  activeView,
  viewData,
  pagination,
  perPageCount,
  pageCount,
  loading,
  businessesData = [],
  departmentsData = [],
  isSuperAdmin = false
}: MasterConfigViewsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  const handleViewChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString())

    params.set('view', newValue)
    params.delete('page')
    params.delete('q') // Clear query on view change

    router.push(`/master-config?${params.toString()}`, { scroll: false })
  }

  const views = [
    { value: 'cost-centers', label: 'Cost Centers' },
    { value: 'user-types', label: 'User Types' },
    { value: 'owner-types', label: 'Owner Types' },
    { value: 'facility-types', label: 'Facility Types' },
    { value: 'asset-statuses', label: 'Asset Statuses' },
    { value: 'departments', label: 'Departments' },
    { value: 'designations', label: 'Designations' }
  ]

  const filteredViews = views.filter(viewItem =>
    viewItem.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeMeta = CONFIG_METADATA[activeView] || CONFIG_METADATA['cost-centers']

  return (
    <Box className='flex flex-col gap-6 w-full'>
      {/* Title Header */}
      <Box className='flex flex-col gap-1'>
        <Typography variant='h4' className='font-bold tracking-tight text-textPrimary'>
          Master Configuration
        </Typography>
        <Typography variant='body2' className='text-textSecondary'>
          Setup system-wide constants, categories, and codes to standardise operations.
        </Typography>
      </Box>

      {/* Grid Layout */}
      <Box className='grid grid-cols-12 gap-6 w-full items-start'>
        {/* Left Sidebar Pane */}
        <Box className='col-span-12 lg:col-span-3 flex flex-col gap-4 w-full'>
          <Card className='border border-divider shadow-sm rounded-xl overflow-hidden'>
            <CardContent className='flex flex-col gap-4 p-4'>
              <Typography variant='subtitle2' className='font-bold uppercase tracking-wider text-textSecondary text-[10px] px-1'>
                Configurations List
              </Typography>

              {/* Search Settings Input */}
              <TextField
                fullWidth
                size='small'
                placeholder='Find configuration...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-search-2-line text-textSecondary text-lg' />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position='end' className='cursor-pointer' onClick={() => setSearchQuery('')}>
                        <i className='ri-close-line text-textSecondary text-lg' />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'var(--mui-palette-background-default)'
                  }
                }}
              />

              {/* Vertical Navigation List */}
              <Box className='flex flex-col gap-1'>
                {filteredViews.length > 0 ? (
                  filteredViews.map(viewItem => {
                    const meta = CONFIG_METADATA[viewItem.value]
                    const isActive = activeView === viewItem.value

                    return (
                      <button
                        key={viewItem.value}
                        onClick={() => handleViewChange(viewItem.value)}
                        className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-primary/5 text-primary border-l-4 border-primary font-semibold shadow-xs'
                            : 'text-textSecondary hover:bg-actionHover hover:text-textPrimary border-l-4 border-transparent'
                        }`}
                      >
                        <Box className='flex items-center gap-2.5'>
                          <Box className={`w-7 h-7 rounded-md flex items-center justify-center ${meta.colorClass}`}>
                            <i className={`${meta.icon} text-base`} />
                          </Box>
                          <Typography className='text-[13px] font-semibold'>{viewItem.label}</Typography>
                        </Box>
                        {isActive && (
                          <Box className='px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20'>
                            {pagination.totalData}
                          </Box>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <Typography variant='body2' className='text-textSecondary text-center py-4 italic'>
                    No matching settings.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Content Pane */}
        <Box className='col-span-12 lg:col-span-9 flex flex-col gap-6 w-full'>
          {/* Accent Header Banner */}
          <Card className={`relative overflow-hidden border border-divider shadow-sm rounded-xl bg-gradient-to-r ${activeMeta.bannerGradient}`}>
            {/* Subtle decorative background blob */}
            <Box className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none' />
            <CardContent className='p-4 md:p-5 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <Box className='flex flex-col gap-1 max-w-2xl'>
                <Box className='flex items-center gap-2'>
                  <Box className={`w-6 h-6 rounded-md flex items-center justify-center ${activeMeta.colorClass}`}>
                    <i className={`${activeMeta.icon} text-sm`} />
                  </Box>
                  <Typography className='text-sm font-bold text-textPrimary'>
                    {activeMeta.title} Setting
                  </Typography>
                </Box>
                <Typography className='text-[11px] text-textSecondary leading-relaxed'>
                  {activeMeta.description}
                </Typography>
              </Box>
              <Box className='flex items-center gap-2 bg-backgroundPaper/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-divider shadow-xs shrink-0 self-start md:self-auto'>
                <i className='ri-sparkling-fill text-primary text-xs animate-pulse' />
                <Typography className='text-[10px] font-semibold text-textPrimary'>
                  Configure with Templates
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Active List Panel */}
          <Box className='w-full'>
            {activeView === 'cost-centers' && (
              <CostCentersList
                initialData={viewData}
                initialPagination={pagination}
                perPageCount={perPageCount}
                pageCount={pageCount}
                loading={loading}
                businessesData={businessesData}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            {activeView === 'user-types' && (
              <UserTypesList
                initialData={viewData}
                initialPagination={pagination}
                perPageCount={perPageCount}
                pageCount={pageCount}
                loading={loading}
                businessesData={businessesData}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            {activeView === 'owner-types' && (
              <OwnerTypesList
                initialData={viewData}
                initialPagination={pagination}
                perPageCount={perPageCount}
                pageCount={pageCount}
                loading={loading}
                businessesData={businessesData}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            {activeView === 'facility-types' && (
              <FacilityTypesList
                initialData={viewData}
                initialPagination={pagination}
                perPageCount={perPageCount}
                pageCount={pageCount}
                loading={loading}
                businessesData={businessesData}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            {activeView === 'asset-statuses' && (
              <AssetStatusesList
                initialData={viewData}
                initialPagination={pagination}
                perPageCount={perPageCount}
                pageCount={pageCount}
                loading={loading}
                businessesData={businessesData}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            {activeView === 'departments' && (
              <DepartmentsList
                initialData={viewData}
                initialPagination={pagination}
                perPageCount={perPageCount}
                pageCount={pageCount}
                loading={loading}
                businessesData={businessesData}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            {activeView === 'designations' && (
              <DesignationsList
                initialData={viewData}
                initialPagination={pagination}
                perPageCount={perPageCount}
                pageCount={pageCount}
                loading={loading}
                businessesData={businessesData}
                departmentsData={departmentsData}
                isSuperAdmin={isSuperAdmin}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MasterConfigViews

