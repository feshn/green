"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"

import { IconCart } from "@/components/icons/cart"
import { navIsActive } from "@/lib/nav-is-active"
import { cn } from "@/lib/utils"

type CartButtonProps = ComponentProps<typeof Link> & {
  chipCount?: number
}

/** Figma Cart button (276:415 / 705:1071) */
function CartButton({ className, chipCount = 0, href, ...props }: CartButtonProps) {
  const pathname = usePathname()
  const hrefString = typeof href === "string" ? href : (href?.pathname ?? "")
  const isCurrent = hrefString ? navIsActive(pathname, hrefString) : false

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "ui-header-menu-btn ui-header-menu-btn--cart outline-none focus-visible:ring-2 focus-visible:ring-focus",
        className
      )}
      {...props}
    >
      <IconCart />
      <span className="font-display text-[13px] leading-4 text-white">Корзина</span>
      {chipCount > 0 ? (
        <span className="ui-header-menu-chip">
          {chipCount > 99 ? "99+" : chipCount}
        </span>
      ) : null}
    </Link>
  )
}

export { CartButton }
