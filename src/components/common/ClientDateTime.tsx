'use client'

import { useEffect, useState } from 'react'

import { format } from 'date-fns'

interface ClientDateTimeProps {
  date: string | Date | number | null | undefined
  formatStr?: string // e.g. 'PP' or 'yyyy-MM-dd' or 'toLocaleDateString' or 'toLocaleString'
  fallback?: string
}

export default function ClientDateTime({ date, formatStr = 'MM/dd/yyyy', fallback = '-' }: ClientDateTimeProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !date) {
    return <span suppressHydrationWarning>{fallback}</span>
  }

  try {
    const d = isNaN(Number(date)) ? new Date(date) : new Date(Number(date))
    if (isNaN(d.getTime())) {
      return <span suppressHydrationWarning>{fallback}</span>
    }

    if (formatStr === 'toLocaleDateString') {
      return <span suppressHydrationWarning>{d.toLocaleDateString()}</span>
    }
    if (formatStr === 'toLocaleString') {
      return <span suppressHydrationWarning>{d.toLocaleString()}</span>
    }

    return <span suppressHydrationWarning>{format(d, formatStr)}</span>
  } catch (error) {
    return <span suppressHydrationWarning>{fallback}</span>
  }
}
