import { cn } from "@/lib/utils"

/** Figma Icons / User (276:152) */
export function IconUser({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
    >
      <path
        d="M8 9.583C10.301 9.583 12.167 7.718 12.167 5.417C12.167 3.115 10.301 1.25 8 1.25C5.699 1.25 3.833 3.115 3.833 5.417C3.833 7.718 5.699 9.583 8 9.583Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.917 16.25C2.917 13.75 5.167 11.667 8 11.667C10.833 11.667 13.083 13.75 13.083 16.25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
