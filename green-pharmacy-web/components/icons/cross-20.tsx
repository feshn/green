import { cn } from "@/lib/utils"

/** Figma Components / Cross 20 (621:727) */
export function IconCross20({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10.3334 10.3334"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
    >
      <path
        d="M5.16667 5.16667L1 1M5.16667 5.16667L9.33337 9.33337M5.16667 5.16667L9.33337 1M5.16667 5.16667L1 9.33337"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
