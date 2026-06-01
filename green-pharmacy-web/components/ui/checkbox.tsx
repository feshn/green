"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { IconCheck } from "@/components/icons/check"
import { cn } from "@/lib/utils"

type CheckboxProps = CheckboxPrimitive.Root.Props & {
  hasError?: boolean
}

/** Figma Components / Check box — Default, Filled, Danger */
function Checkbox({ className, hasError = false, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      aria-invalid={hasError || undefined}
      className={cn(
        "peer relative flex size-5 shrink-0 items-center justify-center rounded bg-white outline-none",
        "focus-visible:ring-2 focus-visible:ring-focus",
        "disabled:cursor-not-allowed disabled:opacity-50",
        hasError && "border border-destructive",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-brand-green"
      >
        <IconCheck />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
