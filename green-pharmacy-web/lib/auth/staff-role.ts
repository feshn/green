import type { SupabaseClient } from "@supabase/supabase-js"

export type StaffRole = "admin" | "picker" | "courier"

const STAFF_ROLES: StaffRole[] = ["admin", "picker", "courier"]

export function isStaffRole(value: string | null | undefined): value is StaffRole {
  return STAFF_ROLES.includes(value as StaffRole)
}

/** Staff JWT email must match employees.username; role from DB (RLS). */
export async function getStaffRole(
  supabase: SupabaseClient,
  email: string | undefined
): Promise<StaffRole | null> {
  if (!email) return null

  const { data, error } = await supabase
    .from("employees")
    .select("role")
    .eq("username", email)
    .maybeSingle()

  if (error || !data?.role || !isStaffRole(data.role)) {
    return null
  }

  return data.role
}

export function staffHomePath(role: StaffRole): string {
  return `/${role}`
}
