"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { ProductCartStepper } from "@/components/catalog/product-cart-stepper"
import {
  addToCartAction,
  removeFromCartAction,
  updateCartQuantityAction,
} from "@/lib/cart/actions"
import { clientPrimaryButtonClassName } from "@/components/ui/client-primary-button"
import { cn } from "@/lib/utils"

type AddToCartButtonProps = {
  productId: number
  isAuthenticated: boolean
  initialQuantity?: number
  className?: string
}

export function AddToCartButton({
  productId,
  isAuthenticated,
  initialQuantity = 0,
  className,
}: AddToCartButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [quantity, setQuantity] = useState(initialQuantity)

  useEffect(() => {
    setQuantity(initialQuantity)
  }, [initialQuantity])

  function refresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  if (!isAuthenticated) {
    return (
      <div className={cn("h-11 w-full", className)}>
        <Link
          href="/register"
          className={clientPrimaryButtonClassName}
        >
          Войти и добавить
        </Link>
      </div>
    )
  }

  async function handleAdd() {
    const result = await addToCartAction(productId)
    if (result.ok) {
      setQuantity(1)
      refresh()
    }
  }

  async function handleIncrease() {
    const next = quantity + 1
    const result =
      quantity === 0
        ? await addToCartAction(productId)
        : await updateCartQuantityAction(productId, next)
    if (result.ok) {
      setQuantity(next)
      refresh()
    }
  }

  async function handleDecrease() {
    if (quantity <= 1) {
      const result = await removeFromCartAction(productId)
      if (result.ok) {
        setQuantity(0)
        refresh()
      }
      return
    }

    const next = quantity - 1
    const result = await updateCartQuantityAction(productId, next)
    if (result.ok) {
      setQuantity(next)
      refresh()
    }
  }

  return (
    <div className={cn("h-11 w-full", className)}>
      {quantity > 0 ? (
        <ProductCartStepper
          quantity={quantity}
          disabled={pending}
          onDecrease={() => startTransition(handleDecrease)}
          onIncrease={() => startTransition(handleIncrease)}
        />
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(handleAdd)}
          className={clientPrimaryButtonClassName}
        >
          В корзину
        </button>
      )}
    </div>
  )
}
