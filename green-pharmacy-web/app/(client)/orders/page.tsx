import { redirect } from "next/navigation"

import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import { ClientPageHeader } from "@/components/client/client-page-header"
import { LoginRequiredCard } from "@/components/client/login-required-card"
import { OrderHistoryList } from "@/components/orders/order-history-list"
import { isLoggedInClient } from "@/lib/auth/client-access"
import { getClientSession } from "@/lib/auth/client-session"
import {
  fetchOrderHistory,
  fetchOrderHistoryItems,
  groupItemsByOrderId,
} from "@/lib/orders/queries"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  searchParams: Promise<{ staff?: string }>
}

export default async function OrdersPage({ searchParams }: PageProps) {
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
        <LoginRequiredCard title="Заказы" />
      </>
    )
  }

  const orders = await fetchOrderHistory(supabase, session.user!.id)
  const orderIds = orders.map((o) => o.order_id)
  const items = await fetchOrderHistoryItems(supabase, orderIds)
  const grouped = groupItemsByOrderId(items)
  const itemsByOrderId = Object.fromEntries(grouped.entries())

  return (
    <>
      <StaffHintBanner staff={staff} />
      <div className="mx-auto w-full max-w-[1053px] flex-1 px-4 pb-6 sm:px-6 lg:px-0">
        <ClientPageHeader title="Заказы" />
        <OrderHistoryList
          className="mt-5"
          orders={orders}
          itemsByOrderId={itemsByOrderId}
        />
      </div>
    </>
  )
}
