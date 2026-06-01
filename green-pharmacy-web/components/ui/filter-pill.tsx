"use client"

import { useEffect, useRef, useState } from "react"

import { IconCheck16 } from "@/components/icons/check-16"
import { IconDoubleArrow } from "@/components/icons/double-arrow"
import { IconFilter } from "@/components/icons/filter"
import { FilterCheckbox } from "@/components/ui/filter-checkbox"
import { cn } from "@/lib/utils"

type FilterOption = {
  value: string
  label: string
}

type FilterPillBaseProps = {
  displayLabel: string
  options: FilterOption[]
  className?: string
}

type SortFilterPillProps = FilterPillBaseProps & {
  variant: "sort"
  value: string
  onChange: (value: string) => void
}

type CategoryFilterPillProps = FilterPillBaseProps & {
  variant: "category"
  values: string[]
  onToggle: (value: string) => void
}

export type FilterPillProps = SortFilterPillProps | CategoryFilterPillProps

/** Figma Segment pill (330:1123) + dropdown (Sort 01–02) */
export function FilterPill(props: FilterPillProps) {
  const { displayLabel, options, variant, className } = props
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className={cn("relative z-50", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex items-center gap-[3px] rounded-2xl bg-white px-3 py-1.5 font-sans text-[13px] leading-4",
          open && "border-2 border-focus",
          !open && "border-2 border-transparent",
          variant === "sort" ? "text-neutral-70" : "text-black/70"
        )}
      >
        {displayLabel}
        {variant === "sort" ? (
          <IconDoubleArrow className="text-neutral-70" />
        ) : (
          <IconFilter className="text-neutral-70" />
        )}
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable={variant === "category" ? true : undefined}
          className="absolute top-[calc(100%+10px)] left-0 z-50 flex w-[228px] flex-col gap-3 rounded-lg bg-white px-3 pt-3 pb-4 shadow-[0_16px_20px_rgba(0,0,0,0.1)]"
        >
          {options.map((option) => {
            const selected =
              variant === "sort"
                ? option.value === props.value
                : props.values.includes(option.value)

            return (
              <button
                key={option.value || option.label}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  if (variant === "sort") {
                    props.onChange(option.value)
                    setOpen(false)
                  } else {
                    props.onToggle(option.value)
                  }
                }}
                className="flex w-full items-center justify-between text-left font-sans text-[13px] leading-4 text-neutral-100"
              >
                <span>{option.label}</span>
                {variant === "sort" ? (
                  selected ? (
                    <IconCheck16 className="text-brand-green" />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )
                ) : (
                  <FilterCheckbox checked={selected} />
                )}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
