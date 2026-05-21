import Link from "next/link"

import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signOutClientAction } from "@/lib/auth/client-actions"
import {
  getClientProfile,
  isProfileComplete,
} from "@/lib/auth/client-profile"
import { formatPhoneDisplay } from "@/lib/auth/client-phone"
import { getStaffRole } from "@/lib/auth/staff-role"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type PageProps = {
  searchParams: Promise<{ staff?: string }>
}

export default async function ClientHomePage({ searchParams }: PageProps) {
  const { staff } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const q = staff ? `?staff=${staff}` : ""
    redirect(`/register${q}`)
  }

  const employeeRole = await getStaffRole(supabase, user.email)
  if (employeeRole) {
    redirect(`/${employeeRole}`)
  }

  const profile = await getClientProfile(supabase, user.id)
  if (!isProfileComplete(profile)) {
    redirect("/register")
  }

  return (
    <>
      <StaffHintBanner staff={staff} />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-display)]">
              Добро пожаловать{profile?.name ? `, ${profile.name}` : ""}
            </CardTitle>
            <CardDescription>
              Клиентский вход выполнен (E1). Каталог и корзина — в E2–E3.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            {profile?.phone ? (
              <p>
                Телефон:{" "}
                <span className="text-foreground">
                  {formatPhoneDisplay(profile.phone)}
                </span>
              </p>
            ) : null}
            <p>
              <code className="text-foreground">users.id</code> совпадает с{" "}
              <code className="text-foreground">auth.uid()</code>:{" "}
              <code className="text-foreground text-xs">{user.id}</code>
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Изменить профиль
              </Link>
              <form action={signOutClientAction}>
                <Button type="submit" variant="ghost" size="sm">
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
