import Link from "next/link"
import { redirect } from "next/navigation"
import { User } from "lucide-react"

import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import { LoginRequiredCard } from "@/components/client/login-required-card"
import { signOutClientAction } from "@/lib/auth/client-actions"
import { formatPhoneDisplay } from "@/lib/auth/client-phone"
import { isLoggedInClient } from "@/lib/auth/client-access"
import { getClientSession } from "@/lib/auth/client-session"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-display)]">
              <User className="size-5" aria-hidden />
              Профиль
            </CardTitle>
            <CardDescription>Краткая информация и выход из аккаунта.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Имя</dt>
                <dd className="font-medium">{profile?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Телефон</dt>
                <dd className="font-medium">
                  {profile?.phone ? formatPhoneDisplay(profile.phone) : "—"}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                В каталог
              </Link>
              <form action={signOutClientAction}>
                <Button type="submit" variant="secondary" size="sm">
                  Выйти
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
