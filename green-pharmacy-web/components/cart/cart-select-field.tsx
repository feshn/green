"use client"

import { useEffect, useId, useRef, useState } from "react"

import { IconArrowDown24 } from "@/components/icons/arrow-down-24"
import { IconCheck20 } from "@/components/icons/check-20"
import { IconFrame } from "@/components/icons/icon-frame"
import { IconPin } from "@/components/icons/pin"
import { cn } from "@/lib/utils"

export type CartSelectOption = {
  value: number
  label: string
}

type CartSelectFieldProps = {
  placeholder: string
  value: number | null
  options: CartSelectOption[]
  onChange: (value: number) => void
  disabled?: boolean
  trailingIcon?: "chevron" | "pin"
  className?: string
}

/** Figma dropdown open (690:728) */
export function CartSelectField({
  placeholder,
  value,
  options,
  onChange,
  disabled,
  trailingIcon = "chevron",
  className,
}: CartSelectFieldProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selected = options.find((o) => o.value === value)
  const label = selected?.label ?? placeholder

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "box-border flex h-11 w-full items-center justify-between rounded-[12px] border-2 bg-page py-3.5 pr-2 pl-3 text-left",
          open ? "border-focus" : "border-transparent",
          disabled && "opacity-50"
        )}
      >
        <span
          className={cn(
            "text-[13px] leading-[16px]",
            selected ? "text-neutral-100" : "text-neutral-100"
          )}
        >
          {label}
        </span>
        {trailingIcon === "pin" ? (
          <IconFrame size={24}>
            <IconPin className="text-neutral-100" />
          </IconFrame>
        ) : (
          <IconFrame size={24}>
            <IconArrowDown24
              className={cn("text-neutral-100", open && "rotate-180")}
            />
          </IconFrame>
        )}
      </button>

      {open && options.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+4px)] left-0 z-20 max-h-[280px] w-full overflow-y-auto rounded-[12px] bg-white px-3 pt-3 pb-4 shadow-[0_16px_20px_rgba(0,0,0,0.1)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-2 py-2 text-left"
                >
                  <span className="text-[13px] leading-[15px] tracking-[0.13px] text-neutral-100">
                    {option.label}
                  </span>
                  {isSelected ? (
                    <IconFrame size={20}>
                      <IconCheck20 className="text-brand-green" />
                    </IconFrame>
                  ) : (
                    <span className="size-5 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
