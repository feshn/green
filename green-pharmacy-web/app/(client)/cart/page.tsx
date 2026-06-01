import { redirect } from "next/navigation"

import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import { CartLineList } from "@/components/cart/cart-line-list"
import { ClientPageHeader } from "@/components/client/client-page-header"
import { CartPaymentPanel } from "@/components/cart/cart-payment-panel"
import { isLoggedInClient } from "@/lib/auth/client-access"
import { getClientSession } from "@/lib/auth/client-session"
import {
  fetchCartLineItems,
  fetchCartOldTotal,
  fetchInCartOrderDraft,
  fetchPickupPoints,
  groupCitiesFromPickupPoints,
} from "@/lib/cart/queries"
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

  const isClient = isLoggedInClient(session)
  const userId = session.user?.id

  const [items, pickupPoints, orderDraft] = await Promise.all([
    isClient && userId
      ? fetchCartLineItems(supabase, userId)
      : Promise.resolve([]),
    fetchPickupPoints(supabase),
    isClient && userId
      ? fetchInCartOrderDraft(supabase, userId)
      : Promise.resolve(null),
  ])

  const total = items.reduce((sum, row) => sum + Number(row.total_item_price), 0)
  const itemCount = items.reduce((sum, row) => sum + row.quantity, 0)
  const oldTotal =
    isClient && items.length > 0
      ? await fetchCartOldTotal(supabase, items)
      : null

  const cities = groupCitiesFromPickupPoints(pickupPoints)
  const initialPharmacyId = orderDraft?.pharmacy_id ?? null
  const initialCityId =
    pickupPoints.find((p) => p.pharmacy_id === initialPharmacyId)?.city_id ??
    cities[0]?.city_id ??
    null

  const hasItems = items.length > 0

  return (
    <>
      <StaffHintBanner staff={staff} />
      <div className="mx-auto w-full max-w-[1053px] flex-1 px-4 pb-6 sm:px-6 lg:px-0">
        <ClientPageHeader title="Корзина" />

        {!hasItems ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_267px] lg:items-start">
            <div className="rounded-[12px] bg-white p-8 text-center shadow-card">
              <p className="text-sm text-neutral-50">
                {isClient
                  ? "Корзина пуста."
                  : "Войдите, чтобы увидеть товары в корзине."}
              </p>
            </div>
            <CartPaymentPanel
              isAuthenticated={isClient}
              itemCount={itemCount}
              total={total}
              oldTotal={oldTotal}
              cities={cities}
              pickupPoints={pickupPoints}
              initialCityId={initialCityId}
              initialPharmacyId={initialPharmacyId}
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_267px] lg:items-start">
            <section className="rounded-[12px] bg-white p-6 shadow-card">
              <CartLineList items={items} />
            </section>
            <CartPaymentPanel
              isAuthenticated={isClient}
              itemCount={itemCount}
              total={total}
              oldTotal={oldTotal}
              cities={cities}
              pickupPoints={pickupPoints}
              initialCityId={initialCityId}
              initialPharmacyId={initialPharmacyId}
            />
          </div>
        )}
      </div>
    </>
  )
}
