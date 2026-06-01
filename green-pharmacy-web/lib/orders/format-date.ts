export function formatOrderDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

/** Figma: «Доставка 7-15 Июня» от даты доставки заказа */
export function formatDeliveryWindow(
  deliveryDate: string | null | undefined
): string {
  if (!deliveryDate) return "Доставка —"

  const start = new Date(`${deliveryDate}T12:00:00`)
  if (Number.isNaN(start.getTime())) return "Доставка —"

  const end = new Date(start)
  end.setDate(start.getDate() + 8)

  const month = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(start)
  const monthLabel = month.charAt(0).toUpperCase() + month.slice(1)

  return `Доставка ${start.getDate()}-${end.getDate()} ${monthLabel}`
}

export function minDeliveryDateIso(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
