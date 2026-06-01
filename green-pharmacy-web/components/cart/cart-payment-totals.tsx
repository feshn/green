import { formatPrice } from "@/lib/catalog/format"
import { cn } from "@/lib/utils"

type CartPaymentTotalsProps = {
  itemCount: number
  total: number
  oldTotal?: number | null
  className?: string
}

export function CartPaymentTotals({
  itemCount,
  total,
  oldTotal,
  className,
}: CartPaymentTotalsProps) {
  const showOld = oldTotal != null && oldTotal > total

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between gap-4 text-neutral-100">
        <p className="font-display text-[15px] leading-[20px] font-bold tracking-[0.3px]">
          К оплате
        </p>
        <p className="text-[13px] leading-[17px] tracking-[-0.39px] text-neutral-100">
          Товаров: {itemCount}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="shrink-0 text-[20px] leading-[28px] font-bold tracking-[-0.6px] text-neutral-100">
          {formatPrice(total)}
        </p>
        {showOld ? (
          <p className="min-w-0 flex-1 text-[17px] leading-[28px] font-medium tracking-[-0.51px] text-neutral-50 line-through">
            {formatPrice(oldTotal)}
          </p>
        ) : null}
      </div>
    </div>
  )
}
