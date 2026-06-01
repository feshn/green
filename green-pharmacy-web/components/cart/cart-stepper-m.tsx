"use client"

import { IconFrame } from "@/components/icons/icon-frame"
import { IconMinus } from "@/components/icons/minus"
import { IconPlusButton } from "@/components/icons/plus-button"
import { cn } from "@/lib/utils"

/** Figma Stepper M (676:671) + Buttons (392:1071) */
type CartStepperMProps = {
  quantity: number
  disabled?: boolean
  onDecrease: () => void
  onIncrease: () => void
  className?: string
}

export function CartStepperM({
  quantity,
  disabled,
  onDecrease,
  onIncrease,
  className,
}: CartStepperMProps) {
  return (
    <div
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-[12px] border border-border bg-white",
        className
      )}
      role="group"
      aria-label="Количество"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onDecrease}
        className="flex size-8 shrink-0 items-center justify-center disabled:opacity-50"
        aria-label="Уменьшить количество"
      >
        <IconFrame size={24}>
          <IconMinus className="text-brand-green" />
        </IconFrame>
      </button>
      <span
        className="w-[26px] shrink-0 text-center text-[13px] leading-[16px] font-medium tracking-[-0.13px] text-neutral-70"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrease}
        className="flex size-8 shrink-0 items-center justify-center disabled:opacity-50"
        aria-label="Увеличить количество"
      >
        <IconFrame size={24}>
          <IconPlusButton className="text-brand-green" />
        </IconFrame>
      </button>
    </div>
  )
}
