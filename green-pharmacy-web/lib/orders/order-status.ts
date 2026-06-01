export const ORDER_STATUSES = [
  "paid",
  "assembling",
  "packed",
  "in_transit",
  "ready",
  "completed",
  "cancelled",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

const STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "Оплачен",
  assembling: "В сборке",
  packed: "Собран",
  in_transit: "В пути",
  ready: "Готов к выдаче",
  completed: "Завершён",
  cancelled: "Отменён",
}

export function formatOrderStatus(status: string): string {
  if (status in STATUS_LABELS) {
    return STATUS_LABELS[status as OrderStatus]
  }
  return status
}

/** Подписи статуса в списке заказов клиента (Figma 372:2048) */
export function formatClientOrderStatus(status: string): string {
  switch (status) {
    case "paid":
    case "assembling":
      return "Собираем заказ"
    case "packed":
      return "Заказ собран"
    case "in_transit":
      return "Заказ в пути"
    case "ready":
      return "Готов к выдаче"
    case "completed":
      return "Заказ получен"
    case "cancelled":
      return "Отменён"
    default:
      return formatOrderStatus(status)
  }
}
