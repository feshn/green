import { cn } from "@/lib/utils"

/** Figma Icons / Check 16 (470:1236) — dropdown selected state */
export function IconCheck16({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-4 shrink-0", className)}
    >
      <path
        d="M1 4.964L3.701 7.667L10.367 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
