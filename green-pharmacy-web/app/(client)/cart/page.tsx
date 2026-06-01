import Link from "next/link"
import { redirect } from "next/navigation"
import { ShoppingCart } from "lucide-react"

import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import { LoginRequiredCard } from "@/components/client/login-required-card"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { isLoggedInClient } from "@/lib/auth/client-access"
import { getClientSession } from "@/lib/auth/client-session"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  searchParams: Promise<{ staff?: string }>
}

export default async function CartPage({ searchParams }: PageProps) {
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
        <LoginRequiredCard
          title="Корзина"
          description="Войдите, чтобы просматривать корзину и оформлять заказ."
        />
      </>
    )
  }

  return (
    <>
      <StaffHintBanner staff={staff} />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-display)]">
              <ShoppingCart className="size-5" aria-hidden />
              Корзина
            </CardTitle>
            <CardDescription>
              Оформление заказа и управление корзиной — этап E3.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {session.cartCount > 0 ? (
              <p className="text-sm">
                В корзине позиций:{" "}
                <span className="font-medium">{session.cartCount}</span>
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">Корзина пуста.</p>
            )}
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              В каталог
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
