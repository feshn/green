"use client"

import { IconFrame } from "@/components/icons/icon-frame"
import { IconTrash } from "@/components/icons/trash"
import { cn } from "@/lib/utils"

/** Figma Delete button (676:691) */
type CartDeleteButtonProps = {
  disabled?: boolean
  onClick: () => void
  label: string
  className?: string
}

export function CartDeleteButton({
  disabled,
  onClick,
  label,
  className,
}: CartDeleteButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-[12px] border border-border bg-white disabled:opacity-50",
        className
      )}
      aria-label={label}
    >
      <IconFrame size={20}>
        <IconTrash className="text-neutral-50" />
      </IconFrame>
    </button>
  )
}
