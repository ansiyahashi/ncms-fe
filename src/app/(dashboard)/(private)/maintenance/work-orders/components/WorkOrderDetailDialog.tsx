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
import Rating from '@mui/material/Rating'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

interface WorkOrderDetailDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  details?: any
}

const WorkOrderDetailDialog = ({ open, setOpen, details }: WorkOrderDetailDialogProps) => {
  if (!details) return null

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    emergency: 'Emergency'
  }

  const statusLabels = {
    draft: 'Draft',
    assigned: 'Assigned',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    pending_parts: 'Pending Parts',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    closed: 'Closed'
  }

  let priorityColor: 'secondary' | 'success' | 'warning' | 'error' = 'secondary'
  if (details.priority === 'low') priorityColor = 'secondary'
  if (details.priority === 'medium') priorityColor = 'success'
  if (details.priority === 'high') priorityColor = 'warning'
  if (details.priority === 'emergency') priorityColor = 'error'

  let statusColor: 'primary' | 'info' | 'warning' | 'success' | 'secondary' | 'error' = 'primary'
  if (['assigned', 'accepted'].includes(details.status)) statusColor = 'info'
  if (['in_progress', 'pending_parts', 'submitted'].includes(details.status)) statusColor = 'warning'
  if (details.status === 'approved') statusColor = 'success'
  if (details.status === 'closed') statusColor = 'secondary'
  if (details.status === 'rejected') statusColor = 'error'

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth>
      <DialogTitle className='flex items-center justify-between'>
        <Typography variant='h6'>Work Order Details</Typography>
        <Box className='flex gap-2'>
          <Chip
            label={details.type ? details.type.toUpperCase() : 'MAINTENANCE'}
            color='secondary'
            size='small'
            variant='outlined'
          />
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
            <Box className='flex flex-col gap-1'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                WO Number
              </Typography>
              <Typography variant='body1' className='font-bold text-primary'>
                {details.wo_number}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-1'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Facility Name
              </Typography>
              <Typography variant='body1' className='font-medium'>
                {details.facility_name || 'N/A'}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box className='flex flex-col gap-1'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Work Order Title
              </Typography>
              <Typography variant='body1' className='font-medium'>
                {details.title}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box className='flex flex-col gap-1'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Description
              </Typography>
              <Typography variant='body2' style={{ whiteSpace: 'pre-wrap' }}>
                {details.description}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-1'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Assigned Technician
              </Typography>
              <Typography variant='body2' className='font-semibold text-info'>
                {details.technician_name || 'Unassigned'}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-1'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                SLA Due Time
              </Typography>
              <Typography variant='body2' className='font-semibold'>
                {new Date(details.sla_due_time).toLocaleString()} ({details.sla_duration_hours} hours)
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-1'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Labour Cost Recorded
              </Typography>
              <Typography variant='body2' className='font-bold text-success'>
                ${details.labour_cost || '0.00'}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className='flex flex-col gap-1'>
              <Typography variant='caption' color='textSecondary' className='uppercase font-semibold tracking-wider'>
                Date Created
              </Typography>
              <Typography variant='body2'>
                {new Date(details.created_at).toLocaleString()}
              </Typography>
            </Box>
          </Grid>

          {/* Checklist Items */}
          <Grid size={12}>
            <Divider className='my-2' />
            <Typography variant='subtitle2' className='font-semibold mb-2'>
              Checklist Tasks Status
            </Typography>
            {details.checklist && details.checklist.length > 0 ? (
              <List className='bg-actionHover rounded'>
                {details.checklist.map((item: any, idx: number) => (
                  <ListItem key={idx} divider={idx < details.checklist.length - 1}>
                    <ListItemIcon className='!min-w-[32px]'>
                      {item.completed ? (
                        <i className='ri-checkbox-circle-fill text-success text-xl' />
                      ) : (
                        <i className='ri-checkbox-blank-circle-line opacity-40 text-xl' />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.task}
                      secondary={item.completed_at ? `Completed at: ${new Date(item.completed_at).toLocaleString()}` : ''}
                      primaryTypographyProps={{
                        className: item.completed ? 'line-through opacity-60' : ''
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant='body2' color='textSecondary'>
                No checklist tasks defined for this work order.
              </Typography>
            )}
          </Grid>

          {/* Feedback & Closure section */}
          {details.status === 'closed' && (
            <Grid size={12}>
              <Divider className='my-2' />
              <Typography variant='subtitle2' className='font-semibold mb-2'>
                Client Closure & Sign-off Details
              </Typography>
              <Box className='bg-success/5 p-3 rounded border border-success/10 flex flex-col gap-2'>
                <Box className='flex gap-2 items-center'>
                  <Typography variant='body2' className='font-medium'>
                    Client Feedback Rating:
                  </Typography>
                  <Rating value={details.feedback_rating} readOnly size='small' />
                </Box>
                {details.feedback_remarks && (
                  <Typography variant='body2' className='italic'>
                    Feedback: "{details.feedback_remarks}"
                  </Typography>
                )}
                {details.closure_remarks && (
                  <Typography variant='body2'>
                    Closure remarks: {details.closure_remarks}
                  </Typography>
                )}
                {details.closed_at && (
                  <Typography variant='caption' color='textSecondary'>
                    Closed at: {new Date(details.closed_at).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          {/* History transitions */}
          <Grid size={12}>
            <Divider className='my-2' />
            <Typography variant='subtitle2' className='font-semibold mb-3'>
              Work Order Status History Trail
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
                        <Typography variant='body2' className='font-semibold uppercase text-primary text-xs'>
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

export default WorkOrderDetailDialog
