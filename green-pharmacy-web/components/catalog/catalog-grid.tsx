import type { CatalogItem } from "@/lib/catalog/types"

import { ProductCard } from "./product-card"

type CatalogGridProps = {
  items: CatalogItem[]
}

/** Figma grid — 5 cols, gap-x 12, gap-y 24 */
export function CatalogGrid({ items }: CatalogGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <li key={item.product_id}>
          <ProductCard item={item} />
        </li>
      ))}
    </ul>
  )
}
