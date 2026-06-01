import type { ProductDetails, ProductImage } from "@/lib/catalog/types"

export type GalleryImage = {
  url: string
  thumbUrl?: string
  isMain: boolean
}

/** Main first, then остальные; без дублей по URL. */
export function buildGalleryImages(
  images: ProductImage[],
  fallbacks: { previewImage?: string | null; mainImageUrl?: string | null }
): GalleryImage[] {
  const seen = new Set<string>()
  const result: GalleryImage[] = []

  const sorted = [...images].sort(
    (a, b) => Number(b.is_main) - Number(a.is_main)
  )

  for (const img of sorted) {
    const url = img.image_url?.trim()
    if (!url || seen.has(url)) continue
    seen.add(url)
    result.push({ url, isMain: img.is_main })
  }

  for (const url of [fallbacks.previewImage, fallbacks.mainImageUrl]) {
    const trimmed = url?.trim()
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed)
      result.unshift({ url: trimmed, isMain: true })
    }
  }

  return result
}
