import * as React from "react"

import { IconCart } from "@/components/icons/cart"
import { cn } from "@/lib/utils"

type CartButtonProps = React.ComponentProps<"div"> & {
  chipCount?: number
}

/** Figma Components / Cart button (276:415) */
function CartButton({ className, chipCount = 0, ...props }: CartButtonProps) {
  return (
    <div className={cn("relative inline-flex shrink-0", className)} {...props}>
      <div className="flex items-center gap-2 rounded-lg bg-brand-menu py-2 pr-5 pl-3 text-white">
        <IconCart />
        <span className="font-display text-[13px] leading-4 text-white">
          Корзина
        </span>
      </div>
      {chipCount > 0 ? (
        <span className="absolute -top-1.5 -right-1 flex min-w-4 items-center justify-center rounded-[10px] bg-[#fef6e4] px-1 pt-0.5 pb-0.5 text-[13px] leading-3 font-bold text-brand-header">
          {chipCount > 99 ? "99+" : chipCount}
        </span>
      ) : null}
    </div>
  )
}

export { CartButton }
