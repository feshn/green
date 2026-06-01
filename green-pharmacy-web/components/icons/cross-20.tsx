import { cn } from "@/lib/utils"

/** Figma Icons / Cross 20 — `public/icons/cross-20.svg` */
export function IconCross20({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
    >
      <path
        d="M10 10L5.83333 5.83333M10 10L14.1667 14.1667M10 10L14.1667 5.83333M10 10L5.83333 14.1667"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
