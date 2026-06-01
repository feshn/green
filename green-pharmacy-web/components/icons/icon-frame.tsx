import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type IconFrameProps = {
  size: 24 | 20
  children: ReactNode
  className?: string
}

/** Фиксированный слот под иконку — родитель flex не растягивает картинку */
export function IconFrame({ size, children, className }: IconFrameProps) {
  const px = `${size}px`
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: px, height: px, minWidth: px, minHeight: px }}
    >
      {children}
    </span>
  )
}
