"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps, ReactNode } from "react"

import { navIsActive } from "@/lib/nav-is-active"
import { cn } from "@/lib/utils"

type MenuButtonProps = ComponentProps<typeof Link> & {
  chipCount?: number
  children: ReactNode
}

/** Figma Menu button (276:311 / 705:985) */
function MenuButton({
  className,
  chipCount = 0,
  children,
  href,
  ...props
}: MenuButtonProps) {
  const pathname = usePathname()
  const hrefString = typeof href === "string" ? href : (href?.pathname ?? "")
  const isCurrent = hrefString ? navIsActive(pathname, hrefString) : false

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "ui-header-menu-btn ui-header-menu-btn--icon outline-none focus-visible:ring-2 focus-visible:ring-focus",
        className
      )}
      {...props}
    >
      {children}
      {chipCount > 0 ? (
        <span className="ui-header-menu-chip">
          {chipCount > 99 ? "99+" : chipCount}
        </span>
      ) : null}
    </Link>
  )
}

export { MenuButton }
