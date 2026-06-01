import type { ProductDetails } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

const EMPTY = "Не указано"

type DetailField = {
  label: string
  value: string | null | undefined
  multiline?: boolean
}

type ProductDetailsSectionProps = {
  details: ProductDetails | null
  className?: string
}

function DetailBlock({ label, value, multiline }: DetailField) {
  const text = value?.trim() || EMPTY
  const isEmpty = text === EMPTY

  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[15px] font-bold leading-[1.35] tracking-[0.15px] text-[#101915]">
        {label}
      </dt>
      <dd
        className={cn(
          "text-[15px] font-normal leading-[1.45] tracking-[0.075px] text-[#101915]",
          multiline && "whitespace-pre-wrap",
          isEmpty && "text-[#747c7a]"
        )}
      >
        {text}
      </dd>
    </div>
  )
}

/** Figma 317:629 — gap 16px между блоками полей */
export function ProductDetailsSection({
  details,
  className,
}: ProductDetailsSectionProps) {
  const fields: DetailField[] = [
    {
      label: "Лекарственная форма",
      value: details?.dosage_form,
    },
    {
      label: "Состав",
      value: details?.composition,
      multiline: true,
    },
    {
      label: "Производитель",
      value: details?.manufacturer,
    },
    {
      label: "Способ применения",
      value: details?.usage_instructions,
      multiline: true,
    },
  ]

  return (
    <dl className={cn("flex w-full flex-col gap-4", className)}>
      {fields.map((field) => (
        <DetailBlock key={field.label} {...field} />
      ))}
    </dl>
  )
}
