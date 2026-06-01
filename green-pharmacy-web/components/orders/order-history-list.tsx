"use client"

import { IconOrderChevron32 } from "@/components/icons/order-chevron-32"
import { formatPrice } from "@/lib/catalog/format"
import { formatDeliveryWindow } from "@/lib/orders/format-date"
import { formatPickupLocation } from "@/lib/orders/format-location"
import { formatClientOrderStatus } from "@/lib/orders/order-status"
import type { OrderHistoryItemRow, OrderHistoryRow } from "@/lib/orders/types"
import { cn } from "@/lib/utils"

type OrderHistoryListProps = {
  orders: OrderHistoryRow[]
  itemsByOrderId: Record<number, OrderHistoryItemRow[]>
  className?: string
}

export function OrderHistoryList({
  orders,
  itemsByOrderId,
  className,
}: OrderHistoryListProps) {
  if (orders.length === 0) {
    return (
      <p className={cn("text-sm text-neutral-50", className)}>
        Заказов пока нет. После оплаты они появятся здесь.
      </p>
    )
  }

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {orders.map((order) => (
        <OrderCard
          key={order.order_id}
          order={order}
          items={itemsByOrderId[order.order_id] ?? []}
        />
      ))}
    </div>
  )
}

type OrderCardProps = {
  order: OrderHistoryRow
  items: OrderHistoryItemRow[]
}

/** Figma 372:2048 — карточка заказа с аккордеоном */
function OrderCard({ order, items }: OrderCardProps) {
  const pickupLine = formatPickupLocation(order.city_name, order.pharmacy_address)
  const orderLabel = `№ ${order.order_id}`

  return (
    <details className="group relative rounded-[12px] bg-white shadow-card">
      <summary className="cursor-pointer list-none px-4 pt-4 pb-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="pr-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-[17px] leading-[23px] font-bold tracking-[0.34px] text-neutral-100">
                {formatClientOrderStatus(order.status)}
              </p>
              <span className="rounded-[6px] bg-page px-2 py-0.5 text-[12px] leading-4 font-medium tracking-[-0.12px] text-neutral-50">
                {orderLabel}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] leading-[18px] font-semibold tracking-[-0.13px] text-neutral-100">
                {formatDeliveryWindow(order.delivery_date)}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 text-[13px] leading-[18px] font-medium tracking-[-0.13px] text-neutral-50">
                {pickupLine ? <span>{pickupLine}</span> : null}
                <span>9:00 - 20:00</span>
              </div>
            </div>
          </div>
        </div>
        <IconOrderChevron32 className="pointer-events-none absolute top-3 right-4 transition-transform group-open:rotate-180" />
      </summary>

      {items.length > 0 ? (
        <div className="border-t border-border px-4 pt-5 pb-3">
          <ul className="flex flex-col gap-5">
            {items.map((item) => (
              <li
                key={`${item.order_id}-${item.product_id}`}
                className="flex gap-4"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-white">
                  {item.product_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product_image}
                      alt=""
                      className="absolute top-2 left-1.5 size-[49px] object-contain mix-blend-luminosity"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-xs text-neutral-50">
                      —
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="line-clamp-3 text-[13px] leading-[19px] font-medium tracking-[-0.13px] text-neutral-100">
                    {item.product_name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-[17px] leading-[22px] font-semibold tracking-[-0.51px] text-neutral-100">
                      {formatPrice(item.price_at_purchase)}
                    </p>
                    <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-neutral-50">
                      Количество: {item.quantity}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="border-t border-border px-4 py-4 text-sm text-neutral-50">
          Состав недоступен
        </p>
      )}
    </details>
  )
}
