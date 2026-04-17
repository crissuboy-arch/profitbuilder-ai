"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
  defaultChecked?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false)
    const isControlled = checked !== undefined
    const isChecked = isControlled ? checked : internalChecked

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked)
      }
      onCheckedChange?.(e.target.checked)
    }

    return (
      <span className={cn("relative inline-block w-9 h-5 shrink-0 cursor-pointer rounded-full transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          checked={isChecked}
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-10 m-0 w-full h-full"
          {...props}
        />
        <span 
          className={cn(
            "block h-full w-full rounded-full transition-colors",
            isChecked ? "bg-primary" : "bg-input"
          )}
        />
        <span 
          className={cn(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
            isChecked && "translate-x-4"
          )}
        />
      </span>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
