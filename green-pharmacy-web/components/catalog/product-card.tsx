import Link from "next/link"

import { formatPrice } from "@/lib/catalog/format"
import type { CatalogItem } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

type ProductCardProps = {
  item: CatalogItem
  className?: string
}

/** Figma Components / Card (621:636) — фиксированная высота карточки, фото по исходным пропорциям */
export function ProductCard({ item, className }: ProductCardProps) {
  return (
    <Link href={`/products/${item.product_id}`} className={cn("group block w-full", className)}>
      <article className="flex w-full flex-col items-center gap-3">
        <div className="relative flex h-[252px] w-full shrink-0 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-white shadow-card" />
          {item.preview_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.preview_image}
              alt=""
              className="relative z-[1] h-auto max-h-[163px] w-auto max-w-[calc(100%-38px)] object-contain mix-blend-luminosity transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="relative z-[1] font-sans text-xs text-neutral-50">Нет фото</div>
          )}
        </div>

        <div className="flex w-full flex-col items-center gap-2 pl-1">
          <p className="line-clamp-2 w-full overflow-hidden font-sans text-sm leading-[18px] font-medium text-ellipsis text-neutral-100">
            {item.product_name}
          </p>
          <div className="flex w-full items-center gap-2">
            <span className="shrink-0 font-sans text-[17px] leading-5 font-semibold text-neutral-100">
              {formatPrice(item.current_price)}
            </span>
            {item.old_price != null && item.old_price > item.current_price ? (
              <span className="min-w-0 flex-1 font-sans text-[15px] leading-5 font-medium text-neutral-50 line-through">
                {formatPrice(item.old_price)}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  )
}
