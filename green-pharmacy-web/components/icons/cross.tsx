import { cn } from "@/lib/utils"

/** Figma Icons / Cross 20 (276:137) */
export function IconCross({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
    >
      <path
        d="M5.167 5.167L1 1M5.167 5.167L9.333 9.333M5.167 5.167L9.333 1M5.167 5.167L1 9.333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
