import { cn } from "@/lib/utils"

const CHIP_STYLES = [
  { bg: "bg-[rgba(220,237,249,0.8)]", text: "text-[#3f96df]" },
  { bg: "bg-[rgba(247,233,222,0.8)]", text: "text-[#e39a54]" },
] as const

const MAX_CHIPS = 2

type CategoryChipsProps = {
  names: string[]
  className?: string
}

/** Figma Card 01 — подсказки, без состояний / переключения */
export function CategoryChips({ names, className }: CategoryChipsProps) {
  const visible = names.slice(0, MAX_CHIPS)
  if (visible.length === 0) return null

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {visible.map((name, i) => {
        const style = CHIP_STYLES[i % CHIP_STYLES.length]!
        return (
          <li key={name}>
            <span
              className={cn(
                "inline-flex rounded-[5px] px-2 pt-[3px] pb-[5px] text-[13px] font-medium tracking-[0.13px]",
                style.bg,
                style.text
              )}
            >
              {name}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
