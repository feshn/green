import { redirect } from "next/navigation"
import { User } from "lucide-react"

import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import { ClientPageHeader } from "@/components/client/client-page-header"
import { LoginRequiredCard } from "@/components/client/login-required-card"
import { signOutClientAction } from "@/lib/auth/client-actions"
import { formatPhoneDisplay } from "@/lib/auth/client-phone"
import { isLoggedInClient } from "@/lib/auth/client-access"
import { getClientSession } from "@/lib/auth/client-session"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  searchParams: Promise<{ staff?: string }>
}

export default async function ProfilePage({ searchParams }: PageProps) {
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
        <LoginRequiredCard title="Профиль" />
      </>
    )
  }

  const profile = session.profile

  return (
    <>
      <StaffHintBanner staff={staff} />
      <div className="mx-auto w-full max-w-[1053px] flex-1 px-4 pb-6 sm:px-6 lg:px-0">
        <ClientPageHeader title="Профиль" />

        <div className="mt-5 flex flex-col gap-4">
        <section className="rounded-[12px] border border-border bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-header/10 text-brand-header">
              <User className="size-6" aria-hidden />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-neutral-100">
                {profile?.name ?? "—"}
              </p>
              <p className="text-sm text-neutral-50">
                {profile?.phone ? formatPhoneDisplay(profile.phone) : "—"}
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-4 border-t border-border pt-4 text-sm">
            <div>
              <dt className="text-neutral-50">Имя</dt>
              <dd className="mt-1 font-medium text-neutral-100">{profile?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-neutral-50">Телефон</dt>
              <dd className="mt-1 font-medium text-neutral-100">
                {profile?.phone ? formatPhoneDisplay(profile.phone) : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[12px] border border-border bg-white p-4 shadow-card">
          <h2 className="font-display text-base font-bold text-neutral-100">Поддержка</h2>
          <p className="mt-2 text-sm text-neutral-50">
            Чат и звонок в поддержку — заглушка (MVP).
          </p>
        </section>

        <form action={signOutClientAction}>
          <Button type="submit" variant="secondary" size="sm">
            Выйти
          </Button>
        </form>
        </div>
      </div>
    </>
  )
}
