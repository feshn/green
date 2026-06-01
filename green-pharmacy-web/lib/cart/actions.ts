"use server"

import { revalidatePath } from "next/cache"

import { fetchCartOrderId } from "@/lib/cart/queries"
import { fetchCatalogItem } from "@/lib/catalog/queries"
import { ensureClientUserRow } from "@/lib/auth/ensure-client-user"
import { getStaffRole } from "@/lib/auth/staff-role"
import { createClient } from "@/lib/supabase/server"

export type CartActionResult =
  | { ok: true }
  | { ok: false; message: string }

const CLIENT_PATHS = ["/", "/cart", "/checkout", "/orders", "/products"]

function revalidateClientPaths() {
  for (const path of CLIENT_PATHS) {
    revalidatePath(path)
  }
  revalidatePath("/checkout/success")
}

async function requireClientUser(): Promise<
  { ok: true; userId: string } | { ok: false; message: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Войдите, чтобы управлять корзиной" }
  }

  const staffRole = await getStaffRole(supabase, user.email)
  if (staffRole) {
    return { ok: false, message: "Недоступно для учётной записи персонала" }
  }

  const profile = await ensureClientUserRow(supabase, user)
  if (!profile.ok) {
    return { ok: false, message: profile.message }
  }

  return { ok: true, userId: user.id }
}

async function getExistingCartOrderId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ ok: true; orderId: number } | { ok: false; message: string }> {
  const orderId = await fetchCartOrderId(supabase, userId)
  if (orderId == null) {
    return { ok: false, message: "Корзина не найдена. Обновите страницу." }
  }
  return { ok: true, orderId }
}

/** Создаёт корзину только при добавлении товара (RPC, без прямого INSERT — RLS). */
async function resolveCartOrderId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ ok: true; orderId: number } | { ok: false; message: string }> {
  const existing = await fetchCartOrderId(supabase, userId)
  if (existing != null) {
    return { ok: true, orderId: existing }
  }

  const { data: rpcId, error: rpcError } = await supabase.rpc("get_or_create_cart", {
    p_user_id: userId,
  })

  if (!rpcError && rpcId != null) {
    return { ok: true, orderId: rpcId as number }
  }

  const raced = await fetchCartOrderId(supabase, userId)
  if (raced != null) {
    return { ok: true, orderId: raced }
  }

  return {
    ok: false,
    message:
      rpcError?.message ??
      "Не удалось открыть корзину. Выполните supabase/scripts/hotfix_get_or_create_cart.sql в SQL Editor.",
  }
}

export async function addToCartAction(
  productId: number
): Promise<CartActionResult> {
  if (!Number.isFinite(productId) || productId <= 0) {
    return { ok: false, message: "Некорректный товар" }
  }

  const auth = await requireClientUser()
  if (!auth.ok) return auth

  const supabase = await createClient()
  const catalogItem = await fetchCatalogItem(supabase, productId)
  if (!catalogItem || !catalogItem.is_available) {
    return { ok: false, message: "Товар недоступен" }
  }

  const cart = await resolveCartOrderId(supabase, auth.userId)
  if (!cart.ok) return cart

  const { data: existing, error: existingError } = await supabase
    .from("order_items")
    .select("id, quantity")
    .eq("order_id", cart.orderId)
    .eq("product_id", productId)
    .maybeSingle()

  if (existingError) {
    return { ok: false, message: existingError.message }
  }

  if (existing) {
    const { error } = await supabase
      .from("order_items")
      .update({ quantity: (existing.quantity as number) + 1 })
      .eq("id", existing.id)

    if (error) return { ok: false, message: error.message }
  } else {
    const { error } = await supabase.from("order_items").insert({
      order_id: cart.orderId,
      product_id: productId,
      quantity: 1,
      price_at_purchase: catalogItem.current_price,
    })

    if (error) return { ok: false, message: error.message }
  }

  revalidateClientPaths()
  revalidatePath(`/products/${productId}`)
  return { ok: true }
}

export async function updateCartQuantityAction(
  productId: number,
  quantity: number
): Promise<CartActionResult> {
  if (!Number.isFinite(productId) || productId <= 0) {
    return { ok: false, message: "Некорректный товар" }
  }

  const auth = await requireClientUser()
  if (!auth.ok) return auth

  const supabase = await createClient()
  const cart = await getExistingCartOrderId(supabase, auth.userId)
  if (!cart.ok) return cart

  if (quantity <= 0) {
    return removeFromCartAction(productId)
  }

  const { error } = await supabase
    .from("order_items")
    .update({ quantity })
    .eq("order_id", cart.orderId)
    .eq("product_id", productId)

  if (error) return { ok: false, message: error.message }

  revalidateClientPaths()
  return { ok: true }
}

export async function removeFromCartAction(
  productId: number
): Promise<CartActionResult> {
  const auth = await requireClientUser()
  if (!auth.ok) return auth

  const supabase = await createClient()
  const cart = await getExistingCartOrderId(supabase, auth.userId)
  if (!cart.ok) return cart

  const { error } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", cart.orderId)
    .eq("product_id", productId)

  if (error) return { ok: false, message: error.message }

  revalidateClientPaths()
  return { ok: true }
}

export async function saveCheckoutDeliveryAction(
  pharmacyId: number
): Promise<CartActionResult> {
  const auth = await requireClientUser()
  if (!auth.ok) return auth

  if (!Number.isFinite(pharmacyId) || pharmacyId <= 0) {
    return { ok: false, message: "Выберите пункт выдачи" }
  }

  const supabase = await createClient()
  const cart = await getExistingCartOrderId(supabase, auth.userId)
  if (!cart.ok) return cart

  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 7)
  const deliveryDateIso = deliveryDate.toISOString().slice(0, 10)

  const { error } = await supabase
    .from("orders")
    .update({
      pharmacy_id: pharmacyId,
      delivery_date: deliveryDateIso,
    })
    .eq("id", cart.orderId)
    .eq("user_id", auth.userId)
    .eq("status", "in_cart")

  if (error) return { ok: false, message: error.message }

  revalidatePath("/checkout")
  return { ok: true }
}

export async function payOrderStubAction(): Promise<
  | { ok: true; orderId: number }
  | { ok: false; message: string }
> {
  const auth = await requireClientUser()
  if (!auth.ok) return auth

  const supabase = await createClient()
  const cart = await getExistingCartOrderId(supabase, auth.userId)
  if (!cart.ok) return cart

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, pharmacy_id, delivery_date, total_price")
    .eq("id", cart.orderId)
    .maybeSingle()

  if (orderError || !order) {
    return { ok: false, message: orderError?.message ?? "Заказ не найден" }
  }

  if (!order.pharmacy_id) {
    return { ok: false, message: "Выберите пункт выдачи" }
  }

  const { count, error: itemsError } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("order_id", cart.orderId)

  if (itemsError) {
    return { ok: false, message: itemsError.message }
  }

  if ((count ?? 0) === 0) {
    return { ok: false, message: "Корзина пуста" }
  }

  const { error: payError } = await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", cart.orderId)
    .eq("user_id", auth.userId)
    .eq("status", "in_cart")

  if (payError) {
    const needsRlsHotfix = payError.message.includes("row-level security")
    return {
      ok: false,
      message: needsRlsHotfix
        ? `${payError.message} Выполните в Supabase SQL Editor файл supabase/scripts/hotfix_orders_pay_rls.sql (политика orders_update).`
        : payError.message,
    }
  }

  revalidateClientPaths()
  return { ok: true, orderId: cart.orderId }
}
