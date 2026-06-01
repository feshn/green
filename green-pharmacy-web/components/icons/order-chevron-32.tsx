import { cn } from "@/lib/utils"

/** Figma Arrow up/down 32 — аккордеон заказов */
export function IconOrderChevron32({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-8 shrink-0 text-neutral-100", className)}
    >
      <path
        d="M23 13L16 20L9 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
