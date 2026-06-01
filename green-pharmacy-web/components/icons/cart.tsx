import { cn } from "@/lib/utils"

/** Figma Icons / Cart (276:163) */
export function IconCart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
    >
      <path
        d="M13.5 11H4.333L3.083 3.5H16L13.5 11Z"
        fill="currentColor"
      />
      <path
        d="M1 1H2.667L3.083 3.5M3.083 3.5L4.333 11H13.5L16 3.5H3.083"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.167 16C5.627 16 6 15.627 6 15.167C6 14.706 5.627 14.333 5.167 14.333C4.706 14.333 4.333 14.706 4.333 15.167C4.333 15.627 4.706 16 5.167 16Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.667 16C13.127 16 13.5 15.627 13.5 15.167C13.5 14.706 13.127 14.333 12.667 14.333C12.206 14.333 11.833 14.706 11.833 15.167C11.833 15.627 12.206 16 12.667 16Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
