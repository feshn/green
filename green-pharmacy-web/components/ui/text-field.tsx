"use client"

import * as React from "react"
import { useState } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export const TEXT_FIELD_ERROR_SLOT_CLASS =
  "min-h-4 text-[13px] leading-4"

export type FieldControlState = {
  focused?: boolean
  hasError?: boolean
  disabled?: boolean
}

export function fieldControlClasses({
  focused = false,
  hasError = false,
  disabled = false,
}: FieldControlState) {
  return cn(
    "box-border rounded-lg border-2 bg-white outline-none",
    hasError && "border-destructive",
    !hasError && focused && "border-focus",
    !hasError && !focused && "border-transparent",
    disabled && "pointer-events-none opacity-50"
  )
}

export const fieldTextClasses =
  "text-[17px] font-medium leading-6 text-neutral-100"

export const fieldInputClasses =
  "w-full text-[17px] font-medium leading-6 text-neutral-100 placeholder:text-neutral-50"

type TextFieldProps = {
  label: string
  error?: string | null
  htmlFor?: string
  className?: string
  children: React.ReactNode
}

/** Figma Components / Text field — label, control, reserved error slot */
export function TextField({
  label,
  error,
  htmlFor,
  className,
  children,
}: TextFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-[15px] leading-5 font-semibold text-neutral-100"
      >
        {label}
      </Label>
      {children}
      <p
        className={cn(
          TEXT_FIELD_ERROR_SLOT_CLASS,
          error ? "text-destructive" : "text-transparent"
        )}
        role={error ? "alert" : undefined}
      >
        {error || "Ошибка"}
      </p>
    </div>
  )
}

type TextFieldInputProps = Omit<
  React.ComponentProps<"input">,
  "className"
> & {
  hasError?: boolean
  className?: string
}

/** Figma Text field input box — default / focus / danger */
const TextFieldInput = React.forwardRef<
  HTMLInputElement,
  TextFieldInputProps
>(function TextFieldInput(
  { hasError = false, className, disabled, onFocus, onBlur, ...props },
  ref
) {
  const [focused, setFocused] = useState(false)

  return (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={hasError || undefined}
      className={cn(
        fieldControlClasses({ focused, hasError, disabled }),
        fieldInputClasses,
        "box-border h-11 px-3",
        className
      )}
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      {...props}
    />
  )
})

export { TextFieldInput }
