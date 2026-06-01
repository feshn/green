import type { SupabaseClient, User } from "@supabase/supabase-js"

import {
  fetchCartItemCount,
  fetchOrderCount,
} from "@/lib/catalog/queries"
import {
  getClientProfile,
  isProfileComplete,
  type ClientProfile,
} from "@/lib/auth/client-profile"
import { getStaffRole, type StaffRole } from "@/lib/auth/staff-role"

export type ClientSession = {
  user: User | null
  profile: ClientProfile | null
  isProfileComplete: boolean
  staffRole: StaffRole | null
  cartCount: number
  orderCount: number
}

export async function getClientSession(
  supabase: SupabaseClient
): Promise<ClientSession> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      profile: null,
      isProfileComplete: false,
      staffRole: null,
      cartCount: 0,
      orderCount: 0,
    }
  }

  const staffRole = await getStaffRole(supabase, user.email)
  if (staffRole) {
    return {
      user,
      profile: null,
      isProfileComplete: false,
      staffRole,
      cartCount: 0,
      orderCount: 0,
    }
  }

  const profile = await getClientProfile(supabase, user.id)
  const complete = isProfileComplete(profile)

  if (!complete) {
    return {
      user,
      profile,
      isProfileComplete: false,
      staffRole: null,
      cartCount: 0,
      orderCount: 0,
    }
  }

  const [cartCount, orderCount] = await Promise.all([
    fetchCartItemCount(supabase, user.id),
    fetchOrderCount(supabase, user.id),
  ])

  return {
    user,
    profile,
    isProfileComplete: true,
    staffRole: null,
    cartCount,
    orderCount,
  }
}
