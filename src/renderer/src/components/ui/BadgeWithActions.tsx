import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

type Action = {
  label?: string
  onClick: () => void
  icon?: React.ReactNode
}

interface BadgeWithActionsProps {
  label: string
  actions: Action[]
  className?: string
}

export const BadgeWithActions: React.FC<BadgeWithActionsProps> = ({
  label,
  actions,
  className
}) => {
  // Refs to measure the widths of the label and the actions container.
  const labelRef = useRef<HTMLSpanElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  const [hovered, setHovered] = useState(false)
  const [labelWidth, setLabelWidth] = useState(0)
  const [actionsWidth, setActionsWidth] = useState(0)

  // Measure widths on mount and when label or actions change.
  useEffect(() => {
    if (labelRef.current) setLabelWidth(labelRef.current.offsetWidth)
    if (actionsRef.current) setActionsWidth(actionsRef.current.offsetWidth)
  }, [label, actions])

  // Define a gap between label and actions (adjust if needed).
  const GAP_WIDTH = 8
  // Compute the full width when hovered.
  const fullWidth = labelWidth + (actionsWidth ? actionsWidth + GAP_WIDTH : 0)
  // Use the measured label width when not hovered.
  const containerWidth = hovered ? fullWidth : labelWidth

  return (
    <div
      className={cn(
        'inline-flex items-center border rounded-md bg-primary text-primary-foreground border-transparent overflow-hidden transition-all duration-300 ease-in-out',
        className
      )}
      style={{ width: containerWidth || 'auto' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span ref={labelRef} className="px-2 py-0.5 text-xs font-medium whitespace-nowrap">
        {label}
      </span>
      {/* Actions container: opacity and transform transitions for fade and slide in/out. */}
      <div
        ref={actionsRef}
        className={cn(
          'flex items-center gap-1 ml-2 transition-all duration-300 ease-in-out',
          hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
        )}
      >
        {actions.map((action, index) => (
          <CustomActionButton
            key={index}
            onClick={action.onClick}
            size={'xs'}
            label={action.label}
            icon={action.icon} // Forward the icon prop
          />
        ))}
      </div>
    </div>
  )
}

const actionButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 transition-[color,box-shadow]',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-muted hover:text-muted-foreground',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground'
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        xs: 'h-7 px-1 min-w-7',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

// MODIFIED: Extend the button props to include variant and size.
export interface CustomActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {
  label?: string
  icon?: React.ReactNode
}

export const CustomActionButton: React.FC<CustomActionButtonProps> = ({
  label,
  icon,
  variant,
  size,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      aria-label={label}
      className={cn(actionButtonVariants({ variant, size, className }))}
    >
      {icon}
    </button>
  )
}
