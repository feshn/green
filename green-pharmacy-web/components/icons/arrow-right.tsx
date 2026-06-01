import { cn } from "@/lib/utils"

type IconArrowRightProps = {
  className?: string
}

/** Figma Icons / Arrow right (470:924) */
export function IconArrowRight({ className }: IconArrowRightProps) {
  return (
    <svg
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-6", className)}
    >
      <path
        d="M7 13L1 7L7 1M1 7H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
