"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"

import { CartPaymentTotals } from "@/components/cart/cart-payment-totals"
import { CartSelectField } from "@/components/cart/cart-select-field"
import { IconDeliveryCalendar } from "@/components/icons/delivery-calendar"
import {
  clientPrimaryButtonClassName,
} from "@/components/ui/client-primary-button"
import {
  payOrderStubAction,
  saveCheckoutDeliveryAction,
} from "@/lib/cart/actions"
import type { CityOption, PickupPoint } from "@/lib/cart/types"
import { cn } from "@/lib/utils"

type CartPaymentPanelProps = {
  isAuthenticated: boolean
  itemCount: number
  total: number
  oldTotal?: number | null
  cities?: CityOption[]
  pickupPoints?: PickupPoint[]
  initialCityId?: number | null
  initialPharmacyId?: number | null
  className?: string
}

/** Figma 337:238 (гость) / 344:1133 (клиент) */
export function CartPaymentPanel({
  isAuthenticated,
  itemCount,
  total,
  oldTotal,
  cities = [],
  pickupPoints = [],
  initialCityId = null,
  initialPharmacyId = null,
  className,
}: CartPaymentPanelProps) {
  const hasItems = itemCount > 0

  if (!isAuthenticated) {
    return (
      <aside
        className={cn(
          "flex w-full flex-col items-stretch gap-[14px] rounded-[12px] bg-white p-3 shadow-card",
          className
        )}
      >
        <CartPaymentTotals
          itemCount={itemCount}
          total={total}
          oldTotal={oldTotal}
        />
        {hasItems ? (
          <Link
            href="/register"
            className={clientPrimaryButtonClassName}
          >
            Войти и оплатить
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className={clientPrimaryButtonClassName}
          >
            Войти и оплатить
          </button>
        )}
      </aside>
    )
  }

  return (
    <CartPaymentPanelAuth
      className={className}
      itemCount={itemCount}
      total={total}
      oldTotal={oldTotal}
      cities={cities}
      pickupPoints={pickupPoints}
      initialCityId={initialCityId}
      initialPharmacyId={initialPharmacyId}
    />
  )
}

type CartPaymentPanelAuthProps = {
  itemCount: number
  total: number
  oldTotal?: number | null
  cities: CityOption[]
  pickupPoints: PickupPoint[]
  initialCityId: number | null
  initialPharmacyId: number | null
  className?: string
}

function CartPaymentPanelAuth({
  itemCount,
  total,
  oldTotal,
  cities,
  pickupPoints,
  initialCityId,
  initialPharmacyId,
  className,
}: CartPaymentPanelAuthProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const hasItems = itemCount > 0

  const defaultCityId =
    initialCityId ?? cities[0]?.city_id ?? pickupPoints[0]?.city_id ?? null

  const [cityId, setCityId] = useState<number | null>(defaultCityId)
  const [pharmacyId, setPharmacyId] = useState<number | null>(initialPharmacyId)

  const pointsInCity = useMemo(
    () => pickupPoints.filter((p) => p.city_id === cityId),
    [pickupPoints, cityId]
  )

  const cityOptions = useMemo(
    () =>
      cities.map((city) => ({
        value: city.city_id,
        label: city.city_name,
      })),
    [cities]
  )

  const pickupOptions = useMemo(
    () =>
      pointsInCity.map((point) => ({
        value: point.pharmacy_id,
        label: point.pickup_label,
      })),
    [pointsInCity]
  )

  useEffect(() => {
    if (cityId == null) return
    if (pharmacyId != null && pointsInCity.some((p) => p.pharmacy_id === pharmacyId)) {
      return
    }
    const first = pointsInCity[0]
    if (first) setPharmacyId(first.pharmacy_id)
  }, [cityId, pharmacyId, pointsInCity])

  const deliveryReady =
    cityId != null &&
    pharmacyId != null &&
    pointsInCity.some((p) => p.pharmacy_id === pharmacyId)

  const payDisabled = pending || !hasItems || !deliveryReady

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
    <aside
      id="payment"
      className={cn(
        "flex w-full flex-col items-stretch gap-3 rounded-[12px] bg-white p-3 shadow-card",
        className
      )}
    >
      <p className="text-left font-display text-[15px] leading-[20px] font-bold tracking-[0.3px] text-neutral-100">
        Детали доставки
      </p>

      <div className="flex w-full flex-col items-stretch gap-5">
        <div className="flex w-full flex-col items-stretch gap-3">
          <div className="flex w-full flex-col items-stretch gap-3">
            <CartSelectField
              placeholder="Город"
              value={cityId}
              options={cityOptions}
              disabled={pending || cities.length === 0}
              onChange={onCityChange}
            />
            <CartSelectField
              placeholder="Пункт выдачи"
              value={pharmacyId}
              options={pickupOptions}
              disabled={pending || pointsInCity.length === 0}
              trailingIcon="pin"
              onChange={setPharmacyId}
            />
          </div>

          <div className="flex items-center justify-start gap-1">
            <IconDeliveryCalendar className="text-neutral-50" />
            <p className="text-left text-[13px] leading-[17px] font-medium tracking-[-0.39px] text-neutral-50">
              Доставка: 7–19 июня
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3">
          <CartPaymentTotals
            itemCount={itemCount}
            total={total}
            oldTotal={oldTotal}
          />
          {error ? (
            <p className="text-left text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={payDisabled}
            onClick={() => startTransition(handlePay)}
            className={clientPrimaryButtonClassName}
          >
            Оплатить
          </button>
          {hasItems && !deliveryReady ? (
            <p className="text-left text-[13px] leading-[17px] text-neutral-50">
              Выберите город и пункт выдачи, чтобы перейти к оплате.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
