export type CatalogItem = {
  product_id: number
  product_name: string
  category_name: string | null
  current_price: number
  old_price: number | null
  preview_image: string | null
  is_available: boolean
}

export type Category = {
  id: number
  name: string
}

export type ProductDetails = {
  product_id: number
  composition: string | null
  usage_instructions: string | null
  dosage_form: string | null
  manufacturer: string | null
  main_image_url: string | null
}

export type SimilarProduct = {
  similar_product_id: number
  similar_product_name: string
  current_price: number
  old_price: number | null
  preview_image: string | null
}

export type CatalogSort = "popular" | "price_asc" | "price_desc"

export type CatalogFilters = {
  q?: string
  /** Одна или несколько категорий (имена из `categories.name`) */
  categories?: string[]
  sort?: CatalogSort
}

export type ProductImage = {
  image_url: string
  is_main: boolean
}

export type ProductCategoryChip = {
  id: number
  name: string
}
