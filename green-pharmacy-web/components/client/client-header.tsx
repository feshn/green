import Link from "next/link"
import { Suspense } from "react"

import { EvergreenLogo } from "@/components/client/evergreen-logo"
import { ClientHeaderSearch } from "@/components/client/client-header-search"
import { IconBox } from "@/components/icons/box"
import { IconUser } from "@/components/icons/user"
import { isLoggedInClient } from "@/lib/auth/client-access"
import type { ClientSession } from "@/lib/auth/client-session"
import { CartButton } from "@/components/ui/cart-button"
import { MenuButton } from "@/components/ui/menu-button"

type ClientHeaderProps = {
  session: ClientSession
}

function HeaderSearchFallback() {
  return (
    <div className="box-border h-9 w-[400px] max-w-full rounded-lg border-2 border-transparent bg-search-surface/60" />
  )
}

/** Figma Main / Search 01 — Head (337:623) */
export function ClientHeader({ session }: ClientHeaderProps) {
  const isClient = isLoggedInClient(session)
  const cartCount = isClient ? session.cartCount : 0
  const orderCount = isClient ? session.orderCount : 0

  return (
    <header className="sticky top-0 z-50 bg-brand-header">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-12 lg:px-[194px]">
        <div className="flex min-w-0 items-center gap-5">
          <EvergreenLogo />

          <Suspense fallback={<HeaderSearchFallback />}>
            <ClientHeaderSearch />
          </Suspense>
        </div>

        <nav className="flex shrink-0 items-center gap-2" aria-label="Клиент">
          <Link href="/profile" aria-label="Профиль">
            <MenuButton>
              <IconUser />
            </MenuButton>
          </Link>
          <Link href="/orders" aria-label="Заказы">
            <MenuButton chipCount={orderCount}>
              <IconBox />
            </MenuButton>
          </Link>
          <Link href="/cart" aria-label="Корзина">
            <CartButton chipCount={cartCount} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
