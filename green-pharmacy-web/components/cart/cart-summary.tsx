import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { ClientPrimaryLink } from "@/components/ui/client-primary-button"
import { formatPrice } from "@/lib/catalog/format"
import { cn } from "@/lib/utils"

type CartSummaryProps = {
  total: number
  itemCount: number
  checkoutHref?: string
  className?: string
}

export function CartSummary({
  total,
  itemCount,
  checkoutHref = "/checkout",
  className,
}: CartSummaryProps) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-border bg-white p-6 shadow-card",
        className
      )}
    >
      <h2 className="font-display text-lg font-bold text-neutral-100">Итого</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-50">Позиций</dt>
          <dd className="font-medium text-neutral-100">{itemCount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-50">Сумма</dt>
          <dd className="font-display text-xl font-bold text-neutral-100">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>
      {itemCount > 0 ? (
        <Link
          href={checkoutHref}
          className={cn(
            buttonVariants(),
            "mt-6 flex h-11 w-full items-center justify-center rounded-xl font-display text-sm font-bold"
          )}
        >
          Оформить заказ
        </Link>
      ) : (
        <ClientPrimaryLink href="/" className="mt-6">
          В каталог
        </ClientPrimaryLink>
      )}
    </aside>
  )
}
