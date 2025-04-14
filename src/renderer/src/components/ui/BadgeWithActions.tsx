import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

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
        'inline-flex items-center border rounded bg-primary text-primary-foreground border-transparent overflow-hidden transition-all duration-300 ease-in-out',
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
          'flex items-center pr-0.5 gap-1 ml-2 transition-all duration-300 ease-in-out',
          hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
        )}
      >
        {actions.map((action, index) => (
          <CustomActionButton
            key={index}
            onClick={action.onClick}
            label={action.label}
            icon={action.icon} // Forward the icon prop
          />
        ))}
      </div>
    </div>
  )
}

export interface CustomActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  icon?: React.ReactNode
}

export const CustomActionButton: React.FC<CustomActionButtonProps> = ({
  label,
  icon,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      aria-label={label}
      className={cn(
        // Base styling with reversed colors from the badge.
        'inline-flex items-center justify-center rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary',
        'px-1 py-0.5',
        'bg-primary-foreground text-primary',
        // Added hover/unhover visual effects.
        'transform transition duration-200 ease-in-out hover:scale-105 hover:shadow-md',
        className
      )}
    >
      {icon}
    </button>
  )
}
