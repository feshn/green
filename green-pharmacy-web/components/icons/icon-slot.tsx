import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type IconSlotProps = {
  children: ReactNode
  className?: string
}

/** Контейнер 24×24: иконка с внутренними отступами, без растягивания */
export function IconSlot({ children, className }: IconSlotProps) {
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full",
        className
      )}
    >
      {children}
    </span>
  )
}
