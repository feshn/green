import { redirect } from "next/navigation"

import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import { CheckoutSuccessPanel } from "@/components/checkout/checkout-success-panel"
import { LoginRequiredCard } from "@/components/client/login-required-card"
import { isLoggedInClient } from "@/lib/auth/client-access"
import { getClientSession } from "@/lib/auth/client-session"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  searchParams: Promise<{ staff?: string; order?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { staff } = await searchParams
  const supabase = await createClient()
  const session = await getClientSession(supabase)

  if (session.staffRole) {
    redirect(`/${session.staffRole}`)
  }

  if (session.user && !session.isProfileComplete) {
    redirect("/register")
  }

  if (!isLoggedInClient(session)) {
    return (
      <>
        <StaffHintBanner staff={staff} />
        <LoginRequiredCard title="Заказ оформлен" />
      </>
    )
  }

  return (
    <>
      <StaffHintBanner staff={staff} />
      <div className="mx-auto flex w-full max-w-[483px] flex-1 flex-col px-4 sm:px-6">
        <CheckoutSuccessPanel />
      </div>
    </>
  )
}
