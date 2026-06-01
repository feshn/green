/** Парсит `category` из URL: одно значение или несколько через запятую */
export function parseCategoriesParam(
  value: string | string[] | undefined
): string[] {
  if (value == null) return []
  const parts = Array.isArray(value) ? value : [value]
  return parts
    .flatMap((part) => part.split(","))
    .map((name) => name.trim())
    .filter(Boolean)
}

export function serializeCategoriesParam(categories: string[]): string | undefined {
  const unique = [...new Set(categories.map((name) => name.trim()).filter(Boolean))]
  return unique.length > 0 ? unique.join(",") : undefined
}
