import { redirect } from "next/navigation"

import { RegistrationFlow } from "@/components/auth/registration-flow"
import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import {
  getClientProfile,
  isProfileComplete,
} from "@/lib/auth/client-profile"
import { ensureClientUserRow, phoneFromUserMetadata } from "@/lib/auth/ensure-client-user"
import { getStaffRole } from "@/lib/auth/staff-role"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  searchParams: Promise<{ staff?: string }>
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const { staff } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const role = await getStaffRole(supabase, user.email)
    if (role) {
      redirect(`/${role}`)
    }

    let profile = await getClientProfile(supabase, user.id)
    if (!profile) {
      await ensureClientUserRow(supabase, user)
      profile = await getClientProfile(supabase, user.id)
    }
    if (isProfileComplete(profile)) {
      redirect("/")
    }

    return (
      <>
        <StaffHintBanner staff={staff} />
        <div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-page px-4 py-8 -mt-[104px]">
          <RegistrationFlow
            initialStep="profile"
            initialPhone={profile?.phone ?? phoneFromUserMetadata(user) ?? ""}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <StaffHintBanner staff={staff} />
      <div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-page px-4 py-8 -mt-[104px]">
        <RegistrationFlow initialStep="phone" />
      </div>
    </>
  )
}
