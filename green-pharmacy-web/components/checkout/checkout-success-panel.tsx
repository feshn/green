import Link from "next/link"

import { IconSuccess } from "@/components/icons/success"
import { ClientPrimaryLink } from "@/components/ui/client-primary-button"
import { cn } from "@/lib/utils"

type CheckoutSuccessPanelProps = {
  className?: string
}

/** Figma 348:1795 — заглушка успешной оплаты */
export function CheckoutSuccessPanel({ className }: CheckoutSuccessPanelProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-8 pt-[184px]",
        className
      )}
    >
      <div className="flex w-full flex-col items-center gap-5">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-center font-display text-[30px] leading-[36px] font-bold tracking-[0.3px] text-neutral-100">
            Заказ оплачен
          </h1>
          <IconSuccess className="text-brand-green" />
        </div>
        <p className="text-center text-[15px] leading-[21px] font-medium tracking-[-0.15px] text-neutral-100">
          Вам придет СМС с 6-ти значным кодом, когда заказ будет доставлен
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 px-4">
        <ClientPrimaryLink href="/">В каталог</ClientPrimaryLink>
        <Link
          href="/orders"
          className="flex h-11 w-full items-center justify-center rounded-[12px] bg-[rgba(218,235,231,0.8)] px-3 py-3.5 font-display text-sm font-bold leading-[17px] tracking-[0.28px] text-[#0f8c6f]"
        >
          Мои заказы
        </Link>
      </div>
    </div>
  )
}
