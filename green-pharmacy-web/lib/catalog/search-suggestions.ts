import type { SupabaseClient } from "@supabase/supabase-js"

export async function fetchSearchSuggestions(
  supabase: SupabaseClient,
  q: string,
  limit = 8
): Promise<string[]> {
  const trimmed = q.trim()
  if (!trimmed) return []

  const { data, error } = await supabase
    .from("vw_client_catalog")
    .select("product_name")
    .ilike("product_name", `%${trimmed}%`)
    .limit(30)

  if (error) return []

  const seen = new Set<string>()
  const result: string[] = []
  for (const row of data ?? []) {
    const name = row.product_name as string
    if (seen.has(name)) continue
    seen.add(name)
    result.push(name)
    if (result.length >= limit) break
  }
  return result
}
