import { cn } from "@/lib/utils"

/** Figma Plus button 24 — `components/icons/Plus button.svg` */
export function IconPlusButton({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-6 shrink-0", className)}
    >
      <path
        d="M5 12H12M12 12H19M12 12V5M12 12V19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
