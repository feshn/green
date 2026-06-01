"use client"

import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

type CodeSegmentInputProps = {
  value: string
  onChange: (value: string) => void
  hasError?: boolean
  disabled?: boolean
}

export function CodeSegmentInput({
  value,
  onChange,
  hasError = false,
  disabled = false,
}: CodeSegmentInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "")
  const focusIndex = Math.min(value.length, 5)

  function update(next: string) {
    onChange(next.replace(/\D/g, "").slice(0, 6))
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        disabled={disabled}
        onChange={(e) => update(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="sr-only"
        aria-label="Код из SMS, 6 цифр"
      />
      <div
        className="flex gap-2"
        role="group"
        aria-label="Код из SMS"
        onClick={() => inputRef.current?.focus()}
      >
        {digits.map((digit, index) => {
          const filled = digit.length > 0
          const isActive = focused && index === focusIndex
          return (
            <div
              key={index}
              className={cn(
                "flex size-14 items-center justify-center rounded-lg bg-white text-[20px] leading-7 font-medium",
                isActive && "border-2 border-focus",
                !isActive && !hasError && "border-2 border-transparent",
                hasError && !isActive && "border-2 border-destructive/40",
                filled ? "text-neutral-100" : "text-neutral-50"
              )}
            >
              {filled ? digit : "0"}
            </div>
          )
        })}
      </div>
    </div>
  )
}
