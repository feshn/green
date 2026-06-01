"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  payOrderStubAction,
  saveCheckoutDeliveryAction,
} from "@/lib/cart/actions"
import type { CityOption, PickupPoint } from "@/lib/cart/types"
import { formatPrice } from "@/lib/catalog/format"
import { minDeliveryDateIso } from "@/lib/orders/format-date"

type CheckoutPickupFormProps = {
  cities: CityOption[]
  pickupPoints: PickupPoint[]
  initialCityId: number | null
  initialPharmacyId: number | null
  initialDeliveryDate: string | null
  totalPrice: number
}

export function CheckoutPickupForm({
  cities,
  pickupPoints,
  initialCityId,
  initialPharmacyId,
  initialDeliveryDate,
  totalPrice,
}: CheckoutPickupFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const defaultCityId =
    initialCityId ?? cities[0]?.city_id ?? pickupPoints[0]?.city_id ?? null

  const [cityId, setCityId] = useState<number | null>(defaultCityId)
  const [pharmacyId, setPharmacyId] = useState<number | null>(initialPharmacyId)
  const [deliveryDate, setDeliveryDate] = useState(
    initialDeliveryDate ?? minDeliveryDateIso()
  )

  const pointsInCity = useMemo(
    () => pickupPoints.filter((p) => p.city_id === cityId),
    [pickupPoints, cityId]
  )

  const selectedPoint = pickupPoints.find((p) => p.pharmacy_id === pharmacyId)

  function onCityChange(nextCityId: number) {
    setCityId(nextCityId)
    const first = pickupPoints.find((p) => p.city_id === nextCityId)
    setPharmacyId(first?.pharmacy_id ?? null)
  }

  async function handlePay() {
    setError(null)
    if (!pharmacyId) {
      setError("Выберите пункт выдачи")
      return
    }

    const saveResult = await saveCheckoutDeliveryAction(pharmacyId)
    if (!saveResult.ok) {
      setError(saveResult.message)
      return
    }

    const payResult = await payOrderStubAction()
    if (!payResult.ok) {
      setError(payResult.message)
      return
    }

    startTransition(() => {
      router.push(`/checkout/success?order=${payResult.orderId}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-neutral-100">
          Доставка и самовывоз
        </h2>
        <p className="mt-1 text-sm text-neutral-50">
          Выберите город, пункт выдачи и дату. Карта ПВЗ — в следующей фазе.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkout-city">Город</Label>
            <select
              id="checkout-city"
              value={cityId ?? ""}
              disabled={pending}
              onChange={(e) => onCityChange(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {cities.map((city) => (
                <option key={city.city_id} value={city.city_id}>
                  {city.city_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-pickup">Пункт выдачи</Label>
            <select
              id="checkout-pickup"
              value={pharmacyId ?? ""}
              disabled={pending || pointsInCity.length === 0}
              onChange={(e) => setPharmacyId(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {pointsInCity.length === 0 ? (
                <option value="">Нет пунктов в городе</option>
              ) : (
                pointsInCity.map((point) => (
                  <option key={point.pharmacy_id} value={point.pharmacy_id}>
                    {point.pickup_label}
                  </option>
                ))
              )}
            </select>
            {selectedPoint ? (
              <p className="text-xs text-neutral-50">{selectedPoint.address}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-date">Дата получения</Label>
            <input
              id="checkout-date"
              type="date"
              min={minDeliveryDateIso()}
              value={deliveryDate}
              disabled={pending}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-neutral-100">Оплата</h2>
        <p className="mt-1 text-sm text-neutral-50">
          Заглушка: после нажатия заказ переходит в статус «Оплачен». SMS при
          доставке — позже.
        </p>
        <p className="mt-4 font-display text-xl font-bold text-neutral-100">
          К оплате: {formatPrice(totalPrice)}
        </p>
        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          disabled={pending || pointsInCity.length === 0}
          onClick={() => startTransition(handlePay)}
          className="mt-4 h-11 w-full rounded-xl font-display text-sm font-bold"
        >
          Оплатить
        </Button>
      </section>
    </div>
  )
}
