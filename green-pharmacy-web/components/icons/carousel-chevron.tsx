import { cn } from "@/lib/utils"

type IconProps = {
  className?: string
}

/** Figma Arrow left 32 (628:1281) — viewBox 32×32, chevron #1AA481 */
export function IconCarouselChevronLeft({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <path
        d="M19 9L12 16L19 23"
        stroke="#1AA481"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Figma Arrow right 32 (628:1280) */
export function IconCarouselChevronRight({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <path
        d="M13 9L20 16L13 23"
        stroke="#1AA481"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
