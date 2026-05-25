'use client'

import { useRef, useState, useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface TruncatedCellProps {
  value: string
}

export function TruncatedCell({ value }: TruncatedCellProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    setOverflows(el.scrollWidth > el.clientWidth)
  }, [value])

  const inner = (
    <span ref={textRef} className="block truncate">
      {value}
    </span>
  )

  if (!overflows) return inner

  return (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs break-words">
        {value}
      </TooltipContent>
    </Tooltip>
  )
}
