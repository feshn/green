"use client"

import { IconFrame } from "@/components/icons/icon-frame"
import { IconMinus } from "@/components/icons/minus"
import { IconPlusButton } from "@/components/icons/plus-button"
import { cn } from "@/lib/utils"

/** Figma Stepper (673:626) — карточка товара */
type ProductCartStepperProps = {
  quantity: number
  disabled?: boolean
  onDecrease: () => void
  onIncrease: () => void
  className?: string
}

export function ProductCartStepper({
  quantity,
  disabled,
  onDecrease,
  onIncrease,
  className,
}: ProductCartStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex h-11 w-auto shrink-0 items-center rounded-[12px] bg-page",
        className
      )}
      role="group"
      aria-label="Количество в корзине"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onDecrease}
        className="flex shrink-0 items-center justify-center p-2.5 disabled:opacity-50"
        aria-label="Уменьшить количество"
      >
        <IconFrame size={24}>
          <IconMinus className="text-brand-green" />
        </IconFrame>
      </button>
      <span
        className="w-10 shrink-0 text-center text-[15px] leading-[20px] font-medium tracking-[0.15px] text-neutral-100"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrease}
        className="flex shrink-0 items-center justify-center p-2.5 disabled:opacity-50"
        aria-label="Увеличить количество"
      >
        <IconFrame size={24}>
          <IconPlusButton className="text-brand-green" />
        </IconFrame>
      </button>
    </div>
  )
}
