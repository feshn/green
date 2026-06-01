/** Локальные ассеты из public/images/products (components/Images). */
export const DEMO_PRODUCT_IMAGES = {
  big01: "/images/products/big-01.jpg",
  big02: "/images/products/big-02.jpg",
  big03: "/images/products/big-03.jpg",
  min01: "/images/products/min-01.jpg",
  min02: "/images/products/min-02.jpg",
  min03: "/images/products/min-03.jpg",
  prev01: "/images/products/prev-01.jpg",
} as const

const THUMB_BY_MAIN: Record<string, string> = {
  [DEMO_PRODUCT_IMAGES.big01]: DEMO_PRODUCT_IMAGES.min01,
  [DEMO_PRODUCT_IMAGES.big02]: DEMO_PRODUCT_IMAGES.min02,
  [DEMO_PRODUCT_IMAGES.big03]: DEMO_PRODUCT_IMAGES.min03,
}

export function resolveGalleryThumb(mainUrl: string): string {
  return THUMB_BY_MAIN[mainUrl] ?? mainUrl
}
