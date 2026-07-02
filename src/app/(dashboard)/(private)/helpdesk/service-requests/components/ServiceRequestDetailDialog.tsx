'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

interface ServiceRequestDetailDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
}

const ServiceRequestDetailDialog = ({ open, setOpen, details }: ServiceRequestDetailDialogProps) => {
  if (!details) return null

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    emergency: 'Emergency'
  }

  const statusLabels = {
    new: 'New',
    assigned: 'Assigned',
    escalated: 'Escalated',
    work_order_created: 'Work Order Created',
    cancelled: 'Cancelled'
  }

  let priorityColor: 'secondary' | 'success' | 'warning' | 'error' = 'secondary'
  if (details.priority === 'low') priorityColor = 'secondary'
  if (details.priority === 'medium') priorityColor = 'success'
  if (details.priority === 'high') priorityColor = 'warning'
  if (details.priority === 'emergency') priorityColor = 'error'

  let statusColor: 'primary' | 'info' | 'warning' | 'success' | 'secondary' = 'primary'
  if (details.status === 'assigned') statusColor = 'info'
  if (details.status === 'escalated') statusColor = 'warning'
  if (details.status === 'work_order_created') statusColor = 'success'
  if (details.status === 'cancelled') statusColor = 'secondary'

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth>
      <DialogTitle className='flex items-center justify-between'>
        <Typography variant='h6' component='span'>Service Request Details</Typography>
        <Box className='flex gap-2'>
          <Chip
            label={priorityLabels[details.priority as keyof typeof priorityLabels] || details.priority}
            color={priorityColor}
            size='small'
            variant='tonal'
          />
          <Chip
            label={statusLabels[details.status as keyof typeof statusLabels] || details.status}
            color={statusColor}
            size='small'
            variant='tonal'
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers className='pt-4 pb-6'>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-2'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Title
              </Typography>
              <Typography variant='body1' className='font-medium'>
                {details.title}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-2'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Facility
              </Typography>
              <Typography variant='body1' className='font-medium'>
                {details.facility_name || 'N/A'}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box className='flex flex-col gap-2'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Description
              </Typography>
              <Typography variant='body2' style={{ whiteSpace: 'pre-wrap' }}>
                {details.description}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-2'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Assigned Technician
              </Typography>
              <Typography variant='body2' className='font-medium text-info'>
                {details.technician_name || 'Unassigned'}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-2'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Escalation Level
              </Typography>
              <Typography variant='body2' className='font-medium'>
                Level {details.escalation_level}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-2'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Raised By
              </Typography>
              <Typography variant='body2'>
                {details.reporter || 'System / Operator'}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-2'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Date Created
              </Typography>
              <Typography variant='body2'>
                {new Date(details.created_at).toLocaleString()}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Divider className='my-2' />
            <Typography variant='subtitle1' className='font-semibold mb-3 mt-2'>
              Escalation & Action History
            </Typography>
            {details.escalation_history && details.escalation_history.length > 0 ? (
              <Box className='flex flex-col gap-4 pl-2'>
                {details.escalation_history.map((log: any, idx: number) => (
                  <Box key={idx} className='flex gap-4 items-start relative'>
                    {idx < details.escalation_history.length - 1 && (
                      <span className='absolute left-2.5 top-5 bottom-[-20px] w-[2px] bg-divider' />
                    )}
                    <span className='w-5 h-5 rounded-full flex items-center justify-center bg-warning/15 text-warning mt-0.5 z-10'>
                      <i className='ri-arrow-up-circle-fill text-xs' />
                    </span>
                    <Box className='flex flex-col gap-0.5'>
                      <Box className='flex items-center gap-2'>
                        <Typography variant='body2' className='font-medium text-warning'>
                          Escalated to Level {log.level}
                        </Typography>
                        <Typography variant='caption' color='textSecondary'>
                          {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      {log.remarks && (
                        <Typography variant='caption' color='textPrimary' className='italic bg-actionHover p-2 rounded mt-1 border-l-2 border-warning'>
                          Remarks: "{log.remarks}"
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant='body2' color='textSecondary'>
                No escalation transitions logged yet.
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} variant='contained'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ServiceRequestDetailDialog
