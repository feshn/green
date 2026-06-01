import { cn } from "@/lib/utils"

/** Figma filter icon in pill «Категории» */
export function IconFilter({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-[14px] shrink-0", className)}
    >
      <path
        d="M6.417 11.667C6.251 11.667 6.113 11.611 6.001 11.499C5.89 11.387 5.834 11.248 5.833 11.083V7.583L2.45 3.267C2.304 3.072 2.282 2.868 2.385 2.654C2.487 2.44 2.664 2.333 2.917 2.333H11.083C11.336 2.333 11.514 2.44 11.616 2.654C11.718 2.868 11.696 3.072 11.55 3.267L8.167 7.583V11.083C8.167 11.249 8.111 11.387 7.999 11.499C7.887 11.611 7.748 11.667 7.583 11.667H6.417ZM7 7.175L9.888 3.5H4.113L7 7.175Z"
        fill="currentColor"
      />
    </svg>
  )
}
