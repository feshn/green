import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, label: "Корзина" },
  { id: 2, label: "Доставка" },
  { id: 3, label: "Оплата" },
] as const

type CheckoutStep = 1 | 2 | 3

type CheckoutStepperProps = {
  current: CheckoutStep
  className?: string
}

export function CheckoutStepper({ current, className }: CheckoutStepperProps) {
  return (
    <ol
      className={cn("flex flex-wrap items-center gap-2 text-sm", className)}
      aria-label="Этапы оформления"
    >
      {STEPS.map((step, index) => {
        const isActive = step.id === current
        const isDone = step.id < current
        return (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span className="text-neutral-30" aria-hidden>
                /
              </span>
            ) : null}
            <span
              className={cn(
                "font-medium",
                isActive && "text-brand-header",
                isDone && "text-neutral-50",
                !isActive && !isDone && "text-neutral-30"
              )}
            >
              <span className="font-display">{step.id}.</span> {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
