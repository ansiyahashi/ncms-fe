'use client'

import { useState, type ComponentType } from 'react'

interface OpenDialogOnElementClickProps {
  element: ComponentType<any>
  elementProps?: Record<string, any>
  dialog: ComponentType<any>
  dialogProps?: Record<string, any>
}

const OpenDialogOnElementClick = ({
  element: Element,
  elementProps,
  dialog: Dialog,
  dialogProps
}: OpenDialogOnElementClickProps) => {
  const [open, setOpen] = useState(false)

  // Extract onClick from elementProps
  const { onClick: elementOnClick, ...restElementProps } = elementProps || {}

  // Handle onClick event
  const handleOnClick = (e: any) => {
    elementOnClick && elementOnClick(e)
    setOpen(true)
  }

  return (
    <>
      {/* Receive element component as prop and we will pass onclick event which changes state to open */}
      <Element onClick={handleOnClick} {...restElementProps} />
      {/* Receive dialog component as prop and we will pass open and setOpen props to that component */}
      <Dialog open={open} setOpen={setOpen} {...dialogProps} />
    </>
  )
}

export default OpenDialogOnElementClick
