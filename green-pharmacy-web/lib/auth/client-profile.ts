import type { SupabaseClient } from "@supabase/supabase-js"

export type ClientProfile = {
  id: string
  phone: string
  name: string | null
  opd_accepted: boolean
}

export function isProfileComplete(profile: ClientProfile | null): boolean {
  if (!profile) return false
  return Boolean(profile.name?.trim()) && profile.opd_accepted
}

export async function getClientProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ClientProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, phone, name, opd_accepted")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) return null
  return data as ClientProfile
}
