"use client"

import { useRef, useState } from "react"

import {
  formatPhonePartial,
  getPhoneMaskCharacters,
} from "@/lib/auth/client-phone"
import {
  fieldControlClasses,
  fieldTextClasses,
} from "@/components/ui/text-field"
import { cn } from "@/lib/utils"

type PhoneMaskInputProps = {
  id?: string
  value: string
  onChange: (digits: string) => void
  onBlur?: () => void
  hasError?: boolean
  disabled?: boolean
}

export function PhoneMaskInput({
  id,
  value,
  onChange,
  onBlur,
  hasError = false,
  disabled = false,
}: PhoneMaskInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const showPlaceholder = value.length === 0
  const maskChars = getPhoneMaskCharacters(value)

  function update(raw: string) {
    onChange(raw.replace(/\D/g, "").slice(0, 10))
  }

  return (
    <div
      className={cn(
        fieldControlClasses({ focused, hasError, disabled }),
        "flex h-11 w-full items-center pl-3 pr-2"
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <span className={cn(fieldTextClasses, "w-auto shrink-0")}>+7</span>
      <span className="w-2 shrink-0" aria-hidden />
      <div className="relative min-w-0 flex-1">
        <p
          className={cn(fieldTextClasses, "pointer-events-none whitespace-nowrap")}
          aria-hidden
        >
          {showPlaceholder ? (
            <>
              {focused ? (
                <span
                  className="mr-px inline-block h-5 w-px animate-pulse bg-neutral-100 align-text-bottom"
                  aria-hidden
                />
              ) : null}
              {maskChars.map((part, index) => (
                <span
                  key={index}
                  className={part.filled ? "text-neutral-100" : "text-neutral-50"}
                >
                  {part.char}
                </span>
              ))}
            </>
          ) : (
            <>
              <span className="text-neutral-100">{formatPhonePartial(value)}</span>
              {focused ? (
                <span
                  className="ml-px inline-block h-5 w-px animate-pulse bg-neutral-100 align-text-bottom"
                  aria-hidden
                />
              ) : null}
            </>
          )}
        </p>
        <input
          ref={inputRef}
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          disabled={disabled}
          value={value}
          onChange={(e) => update(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            onBlur?.()
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && value.length > 0 && e.currentTarget.selectionStart === 0) {
              e.preventDefault()
              update(value.slice(0, -1))
            }
          }}
          className="absolute inset-0 cursor-text opacity-0"
          aria-invalid={hasError || undefined}
        />
      </div>
    </div>
  )
}
