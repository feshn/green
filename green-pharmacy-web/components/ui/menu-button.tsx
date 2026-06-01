import * as React from "react"

import { cn } from "@/lib/utils"

type MenuButtonProps = React.ComponentProps<"div"> & {
  chipCount?: number
}

/** Figma Components / Menu button (276:311) */
function MenuButton({ className, chipCount = 0, children, ...props }: MenuButtonProps) {
  return (
    <div className={cn("relative inline-flex shrink-0", className)} {...props}>
      <div className="flex size-9 items-center justify-center rounded-lg bg-brand-menu p-2 text-white">
        {children}
      </div>
      {chipCount > 0 ? (
        <span className="absolute -top-1.5 -right-1 flex min-w-4 items-center justify-center rounded-[10px] bg-[#fef6e4] px-1 pt-0.5 pb-0.5 text-[13px] leading-3 font-bold text-brand-header">
          {chipCount > 99 ? "99+" : chipCount}
        </span>
      ) : null}
    </div>
  )
}

export { MenuButton }
