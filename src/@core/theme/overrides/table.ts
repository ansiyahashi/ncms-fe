// MUI Imports
import type { Theme } from '@mui/material/styles'

const table: Theme['components'] = {
  MuiTable: {
    styleOverrides: {
      root: {
        fontSize: '0.75rem', // Reduced font size
        '& .MuiTableHead-root': {
          '& .MuiTableCell-root': {
            fontSize: '0.75rem', // Reduced header font size
            fontWeight: 500,
            letterSpacing: '0.2px',
            lineHeight: 1.8462,
            paddingTop: '0.375rem', // Reduced padding
            paddingBottom: '0.375rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            height: '42px', // Reduced height
            backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)',
            textTransform: 'uppercase',
            color: 'var(--mui-palette-text-primary)',
            '&:first-of-type': {
              paddingLeft: '1rem',
              paddingRight: '0.75rem'
            },
            '&:last-of-type': {
              paddingLeft: '0.75rem',
              paddingRight: '1rem'
            }
          }
        },
        '& .MuiTableBody-root': {
          '& .MuiTableCell-root': {
            fontSize: '0.75rem', // Reduced body font size
            lineHeight: 1.4667,
            paddingTop: '0.375rem', // Reduced padding
            paddingBottom: '0.375rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            height: '42px', // Reduced height
            color: 'var(--mui-palette-text-secondary)',
            '&:first-of-type': {
              paddingLeft: '1rem',
              paddingRight: '0.75rem'
            },
            '&:last-of-type': {
              paddingLeft: '0.75rem',
              paddingRight: '1rem'
            }
          }
        }
      }
    }
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ ownerState }) => ({
        fontSize: '0.75rem', // Reduced font size
        ...(ownerState.variant === 'head' && {
          fontWeight: 500,
          letterSpacing: '0.2px',
          lineHeight: 1.8462,
          backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)',
          textTransform: 'uppercase',
          color: 'var(--mui-palette-text-primary)',
          paddingTop: '0.375rem',
          paddingBottom: '0.375rem',
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          height: '42px'
        }),
        ...(ownerState.variant === 'body' && {
          lineHeight: 1.4667,
          color: 'var(--mui-palette-text-secondary)',
          paddingTop: '0.375rem',
          paddingBottom: '0.375rem',
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          height: '42px'
        })
      })
    }
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-root': {
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.2px',
          lineHeight: 1.8462,
          paddingTop: '0.375rem',
          paddingBottom: '0.375rem',
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          height: '42px',
          backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)',
          textTransform: 'uppercase',
          color: 'var(--mui-palette-text-primary)'
        }
      }
    }
  },
  MuiTableBody: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-root': {
          fontSize: '0.75rem',
          lineHeight: 1.4667,
          paddingTop: '0.375rem',
          paddingBottom: '0.375rem',
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          height: '42px',
          color: 'var(--mui-palette-text-secondary)'
        }
      }
    }
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:not(:last-child)': {
          borderBottom: '1px solid var(--border-color)'
        }
      }
    }
  }
}

export default table
