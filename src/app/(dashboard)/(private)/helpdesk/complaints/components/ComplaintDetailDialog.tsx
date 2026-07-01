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

interface ComplaintDetailDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
}

const ComplaintDetailDialog = ({ open, setOpen, details }: ComplaintDetailDialogProps) => {
  if (!details) return null

  const statusLabels = {
    raised: 'Raised',
    converted_to_sr: 'Converted to SR',
    cancelled: 'Cancelled'
  }

  let statusColor: 'primary' | 'success' | 'secondary' = 'primary'
  if (details.status === 'converted_to_sr') statusColor = 'success'
  if (details.status === 'cancelled') statusColor = 'secondary'

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth>
      <DialogTitle className='flex items-center justify-between'>
        <Typography variant='h6'>Complaint Details</Typography>
        <Chip
          label={statusLabels[details.status as keyof typeof statusLabels] || details.status}
          color={statusColor}
          size='small'
          variant='tonal'
        />
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
                Raised By
              </Typography>
              <Typography variant='body2'>
                {details.reporter || 'System / Occupier'}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-2'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Date Raised
              </Typography>
              <Typography variant='body2'>
                {new Date(details.created_at).toLocaleString()}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Divider className='my-2' />
            <Typography variant='subtitle1' className='font-semibold mb-3 mt-2'>
              Complaint History Log
            </Typography>
            {details.history && details.history.length > 0 ? (
              <Box className='flex flex-col gap-4 pl-2'>
                {details.history.map((log: any, idx: number) => (
                  <Box key={idx} className='flex gap-4 items-start relative'>
                    {idx < details.history.length - 1 && (
                      <span className='absolute left-2.5 top-5 bottom-[-20px] w-[2px] bg-divider' />
                    )}
                    <span className='w-5 h-5 rounded-full flex items-center justify-center bg-primary/10 text-primary mt-0.5 z-10'>
                      <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                    </span>
                    <Box className='flex flex-col gap-0.5'>
                      <Box className='flex items-center gap-2'>
                        <Typography variant='body2' className='font-medium uppercase text-primary'>
                          {statusLabels[log.status as keyof typeof statusLabels] || log.status}
                        </Typography>
                        <Typography variant='caption' color='textSecondary'>
                          {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      {log.remarks && (
                        <Typography variant='caption' color='textPrimary' className='italic bg-actionHover p-2 rounded mt-1 border-l-2 border-primary'>
                          Remarks: "{log.remarks}"
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant='body2' color='textSecondary'>
                No transitions logged yet.
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

export default ComplaintDetailDialog
