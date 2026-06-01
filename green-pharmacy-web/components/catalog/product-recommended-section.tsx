import { CatalogGrid } from "@/components/catalog/catalog-grid"
import type { CatalogItem } from "@/lib/catalog/types"

type ProductRecommendedSectionProps = {
  categoryName: string
  items: CatalogItem[]
}

export function ProductRecommendedSection({
  categoryName,
  items,
}: ProductRecommendedSectionProps) {
  if (!categoryName || items.length === 0) return null

  return (
    <section className="mt-12 space-y-4" aria-labelledby="recommended-heading">
      <h2
        id="recommended-heading"
        className="font-display text-[17px] leading-[1.4] tracking-[0.34px] text-neutral-100"
      >
        {categoryName}
      </h2>
      <CatalogGrid items={items} />
    </section>
  )
}
