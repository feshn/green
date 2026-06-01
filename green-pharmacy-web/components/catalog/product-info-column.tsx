import type { ReactNode } from "react"

import { CategoryChips } from "@/components/catalog/category-chips"
import { ProductDetailsSection } from "@/components/catalog/product-details-section"
import type { ProductDetails } from "@/lib/catalog/types"

type ProductInfoColumnProps = {
  productName: string
  chipNames: string[]
  details: ProductDetails | null
  pricePanel: ReactNode
}

/**
 * Figma Card 01: цена поверх справа; чипы → описание mt-7 (28px); описание на всю ширину блока.
 */
export function ProductInfoColumn({
  productName,
  chipNames,
  details,
  pricePanel,
}: ProductInfoColumnProps) {
  return (
    <div className="relative min-w-0 lg:col-start-2 lg:col-end-4 lg:row-span-2 lg:row-start-1">
      <div className="absolute top-0 right-0 z-10 w-[269px]">{pricePanel}</div>

      <h1 className="font-display text-xl leading-[1.6] tracking-[0.2px] text-[#101915] lg:pr-[293px]">
        {productName}
      </h1>
      <CategoryChips names={chipNames} className="mt-4 lg:pr-[293px]" />
      <ProductDetailsSection details={details} className="mt-7 w-full min-w-0" />
    </div>
  )
}
