import { cn } from "@/lib/utils"

type IconArrowDownProps = {
  className?: string
}

/** Figma Icons / Arrow down (348:1670) */
export function IconArrowDown({ className }: IconArrowDownProps) {
  return (
    <svg
      viewBox="0 0 12 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-6", className)}
    >
      <path
        d="M11 1L6 6L1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
