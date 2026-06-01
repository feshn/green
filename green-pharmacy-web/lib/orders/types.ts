import type { OrderStatus } from "@/lib/orders/order-status"

export type OrderHistoryRow = {
  user_id: string
  order_id: number
  status: OrderStatus | string
  delivery_date: string | null
  pharmacy_address: string | null
  city_name: string | null
  verification_code: string | null
  total_price: number
}

export type OrderHistoryItemRow = {
  order_id: number
  product_id: number
  quantity: number
  price_at_purchase: number
  product_name: string
  product_image: string | null
}
