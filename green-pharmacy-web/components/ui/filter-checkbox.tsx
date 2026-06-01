import { IconCheck16 } from "@/components/icons/check-16"
import { cn } from "@/lib/utils"

type FilterCheckboxProps = {
  checked: boolean
  className?: string
}

/** Figma Check box (470:1253) in category dropdown — Sort 02 (330:1605) */
export function FilterCheckbox({ checked, className }: FilterCheckboxProps) {
  return (
    <span className={cn("relative size-5 shrink-0", className)} aria-hidden>
      <span className="absolute inset-0 rounded bg-[#f7f7f7]" />
      {checked ? (
        <IconCheck16 className="absolute top-0.5 left-0.5 text-brand-green" />
      ) : null}
    </span>
  )
}
