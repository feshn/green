import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  CatalogFilters,
  CatalogItem,
  Category,
  ProductCategoryChip,
  ProductDetails,
  ProductImage,
} from "@/lib/catalog/types"

export type CatalogQueryResult =
  | { ok: true; items: CatalogItem[] }
  | { ok: false; message: string }

export type CategoriesQueryResult =
  | { ok: true; categories: Category[] }
  | { ok: false; message: string }

function applyCatalogFilters(
  items: CatalogItem[],
  filters: CatalogFilters
): CatalogItem[] {
  let result = [...items]

  const q = filters.q?.trim().toLowerCase()
  if (q) {
    result = result.filter((item) =>
      item.product_name.toLowerCase().includes(q)
    )
  }

  const categories = filters.categories?.filter((name) => name.trim()) ?? []
  if (categories.length > 0) {
    const selected = new Set(categories)
    result = result.filter(
      (item) => item.category_name != null && selected.has(item.category_name)
    )
  }

  switch (filters.sort) {
    case "price_asc":
      result.sort((a, b) => a.current_price - b.current_price)
      break
    case "price_desc":
      result.sort((a, b) => b.current_price - a.current_price)
      break
    case "popular":
    default:
      result.sort((a, b) => a.product_id - b.product_id)
      break
  }

  return result
}

export async function fetchCatalog(
  supabase: SupabaseClient,
  filters: CatalogFilters = {}
): Promise<CatalogQueryResult> {
  const { data, error } = await supabase
    .from("vw_client_catalog")
    .select(
      "product_id, product_name, category_name, current_price, old_price, preview_image, is_available"
    )

  if (error) {
    return { ok: false, message: error.message }
  }

  const items = applyCatalogFilters((data ?? []) as CatalogItem[], filters)
  return { ok: true, items }
}

export async function fetchCategories(
  supabase: SupabaseClient
): Promise<CategoriesQueryResult> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  if (error) {
    return { ok: false, message: error.message }
  }

  return { ok: true, categories: (data ?? []) as Category[] }
}

export async function fetchCatalogItem(
  supabase: SupabaseClient,
  productId: number
): Promise<CatalogItem | null> {
  const { data, error } = await supabase
    .from("vw_client_catalog")
    .select(
      "product_id, product_name, category_name, current_price, old_price, preview_image, is_available"
    )
    .eq("product_id", productId)
    .maybeSingle()

  if (error || !data) return null
  return data as CatalogItem
}

export async function fetchProductDetails(
  supabase: SupabaseClient,
  productId: number
): Promise<ProductDetails | null> {
  const { data, error } = await supabase
    .from("product_details")
    .select(
      `
      product_id,
      composition,
      usage_instructions,
      dosage_form ( name ),
      manufacturers ( name )
    `
    )
    .eq("product_id", productId)
    .maybeSingle()

  if (error || !data) return null

  const row = data as Record<string, unknown>
  const dosageRaw = row.dosage_form
  const manufacturerRaw = row.manufacturers

  const dosageForm =
    dosageRaw && typeof dosageRaw === "object" && !Array.isArray(dosageRaw)
      ? (dosageRaw as { name?: string }).name ?? null
      : Array.isArray(dosageRaw) && dosageRaw[0]
        ? (dosageRaw[0] as { name?: string }).name ?? null
        : null

  const manufacturer =
    manufacturerRaw &&
    typeof manufacturerRaw === "object" &&
    !Array.isArray(manufacturerRaw)
      ? (manufacturerRaw as { name?: string }).name ?? null
      : Array.isArray(manufacturerRaw) && manufacturerRaw[0]
        ? (manufacturerRaw[0] as { name?: string }).name ?? null
        : null

  return {
    product_id: row.product_id as number,
    composition: (row.composition as string | null) ?? null,
    usage_instructions: (row.usage_instructions as string | null) ?? null,
    main_image_url: null,
    dosage_form: dosageForm,
    manufacturer,
  }
}

export async function fetchProductImages(
  supabase: SupabaseClient,
  productId: number
): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("image_url, is_main")
    .eq("product_id", productId)
    .order("is_main", { ascending: false })
    .order("id", { ascending: true })

  if (error || !data) return []
  return data as ProductImage[]
}

export async function fetchProductCategoryChips(
  supabase: SupabaseClient,
  productId: number
): Promise<ProductCategoryChip[]> {
  const { data, error } = await supabase
    .from("product_categories")
    .select("category_id, categories ( id, name )")
    .eq("product_id", productId)
    .order("category_id", { ascending: true })

  if (error || !data) return []

  return data
    .map((row) => {
      const raw = row as {
        category_id: number
        categories: { id: number; name: string } | { id: number; name: string }[] | null
      }
      const cat = Array.isArray(raw.categories) ? raw.categories[0] : raw.categories
      if (!cat?.name) return null
      return { id: cat.id, name: cat.name }
    })
    .filter((c): c is ProductCategoryChip => c != null)
}

export async function fetchRecommendedForCategory(
  supabase: SupabaseClient,
  categoryName: string,
  excludeProductId: number,
  limit = 10
): Promise<CatalogItem[]> {
  if (!categoryName.trim()) return []

  const map = await fetchRecommendedByCategory(
    supabase,
    [categoryName],
    excludeProductId
  )
  return map[categoryName]?.slice(0, limit) ?? []
}

export async function fetchRecommendedByCategory(
  supabase: SupabaseClient,
  categoryNames: string[],
  excludeProductId: number
): Promise<Record<string, CatalogItem[]>> {
  const names = categoryNames.slice(0, 2)
  if (names.length === 0) return {}

  const { data: catalogData, error: catalogError } = await supabase
    .from("vw_client_catalog")
    .select(
      "product_id, product_name, category_name, current_price, old_price, preview_image, is_available"
    )

  if (catalogError || !catalogData) return {}

  const catalogById = new Map(
    (catalogData as CatalogItem[]).map((item) => [item.product_id, item])
  )

  const result: Record<string, CatalogItem[]> = {}

  for (const name of names) {
    const { data: links, error } = await supabase
      .from("product_categories")
      .select("product_id, categories!inner ( name )")
      .eq("categories.name", name)

    if (error) {
      result[name] = (catalogData as CatalogItem[])
        .filter(
          (item) =>
            item.category_name === name && item.product_id !== excludeProductId
        )
        .slice(0, 10)
      continue
    }

    const ids = (links ?? [])
      .map((row) => {
        const r = row as { product_id: number }
        return r.product_id
      })
      .filter((id) => id !== excludeProductId)

    result[name] = ids
      .map((id) => catalogById.get(id))
      .filter((item): item is CatalogItem => item != null)
      .slice(0, 10)
  }

  return result
}

export async function fetchCartItemCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("vw_cart_items")
    .select("quantity")
    .eq("user_id", userId)

  if (error || !data) return 0
  return data.reduce((sum, row) => sum + (row.quantity ?? 0), 0)
}

export async function fetchOrderCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("vw_user_order_history")
    .select("order_id", { count: "exact", head: true })
    .eq("user_id", userId)

  if (error) return 0
  return count ?? 0
}
