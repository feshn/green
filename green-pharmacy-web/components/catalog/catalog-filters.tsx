"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

import { FilterPill } from "@/components/ui/filter-pill"
import type { CatalogSort, Category } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

export type CategoryWithCount = Category & {
  productCount?: number
}

type CatalogFiltersProps = {
  categories: CategoryWithCount[]
  initialCategory?: string
  initialSort?: CatalogSort
  className?: string
}

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "popular", label: "Популярное" },
  { value: "price_asc", label: "По возрастанию цены" },
  { value: "price_desc", label: "По убыванию цены" },
]

/** Figma filter bar — Main / Search 01, Sort 01–02 */
export function CatalogFilters({
  categories,
  initialCategory = "",
  initialSort = "popular",
  className,
}: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const pushParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      const qs = params.toString()
      startTransition(() => {
        router.push(qs ? `/?${qs}` : "/")
      })
    },
    [router, searchParams]
  )

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === initialSort)?.label ??
    "Популярное"

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }))

  return (
    <div
      className={cn(
        "relative h-[72px] bg-page",
        isPending && "opacity-70",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-start px-4 pt-8 sm:px-12 lg:px-[194px]">
        <div className="flex items-center gap-2">
          <FilterPill
            displayLabel={sortLabel}
            value={initialSort}
            variant="sort"
            options={SORT_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) => {
              pushParams({
                sort: value === "popular" ? undefined : value,
              })
            }}
          />
          <FilterPill
            displayLabel="Категории"
            value={initialCategory}
            variant="category"
            options={categoryOptions}
            onChange={(value) => {
              pushParams({
                category:
                  value === initialCategory || !value ? undefined : value,
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
