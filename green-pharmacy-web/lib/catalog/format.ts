export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value)
}

export function discountPercent(
  current: number,
  old: number | null | undefined
): number | null {
  if (old == null || old <= current) return null
  return Math.round(((old - current) / old) * 100)
}
