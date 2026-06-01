"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { CartDeleteButton } from "@/components/cart/cart-delete-button"
import { CartStepperM } from "@/components/cart/cart-stepper-m"
import {
  removeFromCartAction,
  updateCartQuantityAction,
} from "@/lib/cart/actions"
import type { CartLineItem } from "@/lib/cart/types"
import { formatPrice } from "@/lib/catalog/format"
import { cn } from "@/lib/utils"

type CartLineListProps = {
  items: CartLineItem[]
  className?: string
}

export function CartLineList({ items, className }: CartLineListProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function refresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  async function changeQuantity(productId: number, next: number) {
    const result = await updateCartQuantityAction(productId, next)
    if (result.ok) refresh()
  }

  async function remove(productId: number) {
    const result = await removeFromCartAction(productId)
    if (result.ok) refresh()
  }

  if (items.length === 0) {
    return (
      <p className={cn("text-sm text-neutral-50", className)}>
        Корзина пуста. Добавьте товары из каталога.
      </p>
    )
  }

  return (
    <ul className={cn("divide-y divide-border", className)} aria-busy={pending}>
      {items.map((item) => {
        const showOldLine =
          item.old_line_total != null &&
          item.old_line_total > Number(item.total_item_price)

        return (
          <li
            key={item.product_id}
            className="flex gap-4 py-4 first:pt-0 last:pb-0"
          >
            <Link
              href={`/products/${item.product_id}`}
              className="relative flex size-20 shrink-0 items-center justify-center rounded-xl bg-white shadow-card"
            >
              {item.product_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product_image}
                  alt=""
                  className="max-h-16 max-w-16 object-contain"
                />
              ) : (
                <span className="text-xs text-neutral-50">Нет фото</span>
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Link
                href={`/products/${item.product_id}`}
                className="line-clamp-2 font-sans text-sm font-medium text-neutral-100 hover:text-brand-header"
              >
                {item.product_name}
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-neutral-100">
                  {formatPrice(item.unit_price)}
                </span>
                <span className="text-neutral-50">× {item.quantity}</span>
              </div>
              <div className="flex items-center gap-2">
                <CartDeleteButton
                  disabled={pending}
                  label={`Удалить ${item.product_name}`}
                  onClick={() => remove(item.product_id)}
                />
                <CartStepperM
                  quantity={item.quantity}
                  disabled={pending}
                  onDecrease={() =>
                    changeQuantity(item.product_id, item.quantity - 1)
                  }
                  onIncrease={() =>
                    changeQuantity(item.product_id, item.quantity + 1)
                  }
                />
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-sans text-sm font-semibold text-neutral-100">
                {formatPrice(item.total_item_price)}
              </p>
              {showOldLine ? (
                <p className="text-[13px] font-medium text-neutral-50 line-through">
                  {formatPrice(item.old_line_total)}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
