export type CartItemRow = {
  user_id: string
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_item_price: number
  product_image: string | null
}

export type CartLineItem = CartItemRow & {
  old_unit_price: number | null
  old_line_total: number | null
}

export type PickupPoint = {
  pharmacy_id: number
  pickup_label: string
  address: string
  latitude: number | null
  longitude: number | null
  city_id: number
  city_name: string
}

export type CityOption = {
  city_id: number
  city_name: string
}
