import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  CartItemRow,
  CartLineItem,
  CityOption,
  PickupPoint,
} from "@/lib/cart/types"

export async function fetchCartItems(
  supabase: SupabaseClient,
  userId: string
): Promise<CartItemRow[]> {
  const { data, error } = await supabase
    .from("vw_cart_items")
    .select(
      "user_id, order_id, product_id, product_name, quantity, unit_price, total_item_price, product_image"
    )
    .eq("user_id", userId)
    .order("product_name")

  if (error || !data) return []
  return data as CartItemRow[]
}

export async function fetchCartLineItems(
  supabase: SupabaseClient,
  userId: string
): Promise<CartLineItem[]> {
  const items = await fetchCartItems(supabase, userId)
  if (items.length === 0) return []

  const productIds = items.map((item) => item.product_id)
  const { data, error } = await supabase
    .from("vw_client_catalog")
    .select("product_id, old_price, current_price")
    .in("product_id", productIds)

  const catalogById = new Map(
    (data ?? []).map((row) => [
      row.product_id as number,
      row as { old_price: number | null; current_price: number },
    ])
  )

  if (error) {
    return items.map((item) => ({
      ...item,
      old_unit_price: null,
      old_line_total: null,
    }))
  }

  return items.map((item) => {
    const catalog = catalogById.get(item.product_id)
    const oldUnit =
      catalog?.old_price != null &&
      catalog.old_price > catalog.current_price
        ? catalog.old_price
        : null
    const oldLineTotal =
      oldUnit != null ? oldUnit * item.quantity : null
    return {
      ...item,
      old_unit_price: oldUnit,
      old_line_total: oldLineTotal,
    }
  })
}

export async function fetchCartOldTotal(
  supabase: SupabaseClient,
  items: CartItemRow[]
): Promise<number | null> {
  if (items.length === 0) return null

  const productIds = items.map((item) => item.product_id)
  const { data, error } = await supabase
    .from("vw_client_catalog")
    .select("product_id, old_price, current_price")
    .in("product_id", productIds)

  if (error || !data) return null

  const priceByProduct = new Map(
    (data as { product_id: number; old_price: number | null; current_price: number }[]).map(
      (row) => [row.product_id, row]
    )
  )

  let sum = 0
  let hasOld = false

  for (const item of items) {
    const catalog = priceByProduct.get(item.product_id)
    const oldUnit =
      catalog?.old_price != null && catalog.old_price > catalog.current_price
        ? catalog.old_price
        : item.unit_price
    if (catalog?.old_price != null && catalog.old_price > catalog.current_price) {
      hasOld = true
    }
    sum += oldUnit * item.quantity
  }

  return hasOld ? sum : null
}

export async function fetchProductCartQuantity(
  supabase: SupabaseClient,
  userId: string,
  productId: number
): Promise<number> {
  const { data, error } = await supabase
    .from("vw_cart_items")
    .select("quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle()

  if (error || !data) return 0
  return data.quantity ?? 0
}

export async function fetchCartOrderId(
  supabase: SupabaseClient,
  userId: string
): Promise<number | null> {
  const { data: fromCartView, error: viewError } = await supabase
    .from("vw_cart_items")
    .select("order_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle()

  if (!viewError && fromCartView?.order_id != null) {
    return fromCartView.order_id as number
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "in_cart")
    .maybeSingle()

  if (error || !data) return null
  return data.id as number
}

export async function fetchPickupPoints(
  supabase: SupabaseClient
): Promise<PickupPoint[]> {
  const { data, error } = await supabase
    .from("vw_pickup_points")
    .select(
      "pharmacy_id, pickup_label, address, latitude, longitude, city_id, city_name"
    )
    .order("city_name")
    .order("pickup_label")

  if (error || !data) return []
  return data as PickupPoint[]
}

export function groupCitiesFromPickupPoints(points: PickupPoint[]): CityOption[] {
  const map = new Map<number, string>()
  for (const point of points) {
    map.set(point.city_id, point.city_name)
  }
  return [...map.entries()]
    .map(([city_id, city_name]) => ({ city_id, city_name }))
    .sort((a, b) => a.city_name.localeCompare(b.city_name, "ru"))
}

export async function fetchInCartOrderDraft(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  order_id: number
  pharmacy_id: number | null
  delivery_date: string | null
  total_price: number
} | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, pharmacy_id, delivery_date, total_price")
    .eq("user_id", userId)
    .eq("status", "in_cart")
    .maybeSingle()

  if (error || !data) return null
  return {
    order_id: data.id as number,
    pharmacy_id: data.pharmacy_id as number | null,
    delivery_date: data.delivery_date as string | null,
    total_price: Number(data.total_price ?? 0),
  }
}
