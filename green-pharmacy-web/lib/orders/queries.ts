import type { SupabaseClient } from "@supabase/supabase-js"

import type { OrderHistoryItemRow, OrderHistoryRow } from "@/lib/orders/types"

export async function fetchOrderHistory(
  supabase: SupabaseClient,
  userId: string
): Promise<OrderHistoryRow[]> {
  const { data, error } = await supabase
    .from("vw_user_order_history")
    .select(
      "user_id, order_id, status, delivery_date, pharmacy_address, total_price"
    )
    .eq("user_id", userId)
    .order("order_id", { ascending: false })

  if (error || !data) return []

  const rows = data as OrderHistoryRow[]
  const orderIds = rows.map((row) => row.order_id)
  const metaByOrderId = await fetchOrderPickupMeta(supabase, orderIds)

  return rows.map((row) => {
    const meta = metaByOrderId.get(row.order_id)
    return {
      ...row,
      city_name: meta?.city_name ?? null,
      verification_code: meta?.verification_code ?? null,
    }
  })
}

type OrderPickupMeta = {
  city_name: string | null
  verification_code: string | null
}

async function fetchOrderPickupMeta(
  supabase: SupabaseClient,
  orderIds: number[]
): Promise<Map<number, OrderPickupMeta>> {
  const map = new Map<number, OrderPickupMeta>()
  if (orderIds.length === 0) return map

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, verification_code, pharmacies ( address, cities ( name ) )"
    )
    .in("id", orderIds)

  if (error || !data) return map

  for (const row of data) {
    const pharmacyRaw = row.pharmacies as
      | { cities?: { name?: string } | { name?: string }[] | null }
      | { cities?: { name?: string } | { name?: string }[] | null }[]
      | null

    const pharmacy = Array.isArray(pharmacyRaw) ? pharmacyRaw[0] : pharmacyRaw
    const citiesRaw = pharmacy?.cities
    const cityName = Array.isArray(citiesRaw)
      ? citiesRaw[0]?.name
      : citiesRaw?.name

    map.set(row.id as number, {
      city_name: cityName ?? null,
      verification_code: (row.verification_code as string | null) ?? null,
    })
  }

  return map
}

export async function fetchOrderHistoryItems(
  supabase: SupabaseClient,
  orderIds: number[]
): Promise<OrderHistoryItemRow[]> {
  if (orderIds.length === 0) return []

  const { data, error } = await supabase
    .from("order_items")
    .select("order_id, product_id, quantity, price_at_purchase, products ( name )")
    .in("order_id", orderIds)

  if (error || !data) return []

  const productIds = [...new Set(data.map((row) => row.product_id as number))]
  const imageByProduct = await fetchMainImagesByProduct(supabase, productIds)

  return data.map((row) => {
    const productRaw = row.products as { name?: string } | { name?: string }[] | null
    const name = Array.isArray(productRaw)
      ? productRaw[0]?.name
      : productRaw?.name
    const productId = row.product_id as number
    return {
      order_id: row.order_id as number,
      product_id: productId,
      quantity: row.quantity as number,
      price_at_purchase: Number(row.price_at_purchase),
      product_name: name ?? "Товар",
      product_image: imageByProduct.get(productId) ?? null,
    }
  })
}

async function fetchMainImagesByProduct(
  supabase: SupabaseClient,
  productIds: number[]
): Promise<Map<number, string | null>> {
  const map = new Map<number, string | null>()
  if (productIds.length === 0) return map

  const { data } = await supabase
    .from("product_images")
    .select("product_id, image_url")
    .in("product_id", productIds)
    .eq("is_main", true)

  for (const row of data ?? []) {
    map.set(row.product_id as number, (row.image_url as string) ?? null)
  }
  return map
}

export function groupItemsByOrderId(
  items: OrderHistoryItemRow[]
): Map<number, OrderHistoryItemRow[]> {
  const map = new Map<number, OrderHistoryItemRow[]>()
  for (const item of items) {
    const list = map.get(item.order_id) ?? []
    list.push(item)
    map.set(item.order_id, list)
  }
  return map
}
