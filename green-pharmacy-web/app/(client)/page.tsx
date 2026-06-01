import { Suspense } from "react"
import { redirect } from "next/navigation"

import { CatalogEmpty, CatalogError } from "@/components/catalog/catalog-states"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogGrid } from "@/components/catalog/catalog-grid"
import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import { Skeleton } from "@/components/ui/skeleton"
import { getClientSession } from "@/lib/auth/client-session"
import { fetchCatalog, fetchCategories } from "@/lib/catalog/queries"
import { parseCategoriesParam } from "@/lib/catalog/parse-categories"
import type { CatalogSort } from "@/lib/catalog/types"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  searchParams: Promise<{
    staff?: string
    q?: string
    category?: string
    sort?: string
  }>
}

function parseSort(value: string | undefined): CatalogSort {
  if (value === "price_asc" || value === "price_desc") {
    return value
  }
  return "popular"
}

function FiltersSkeleton() {
  return <div className="h-[72px] bg-page" />
}

function GridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i}>
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1 h-4 w-1/2" />
        </li>
      ))}
    </ul>
  )
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { staff, q, category: categoryParam, sort: sortParam } = params
  const sort = parseSort(sortParam)
  const selectedCategories = parseCategoriesParam(categoryParam)

  const supabase = await createClient()
  const session = await getClientSession(supabase)

  if (session.staffRole) {
    redirect(`/${session.staffRole}`)
  }

  if (session.user && !session.isProfileComplete) {
    redirect("/register")
  }

  const [catalogResult, categoriesResult, allCatalogResult] = await Promise.all([
    fetchCatalog(supabase, { q, categories: selectedCategories, sort }),
    fetchCategories(supabase),
    fetchCatalog(supabase, {}),
  ])

  const categoryCounts = new Map<string, number>()
  if (allCatalogResult.ok) {
    for (const item of allCatalogResult.items) {
      if (!item.category_name) continue
      categoryCounts.set(
        item.category_name,
        (categoryCounts.get(item.category_name) ?? 0) + 1
      )
    }
  }

  const categories = (categoriesResult.ok ? categoriesResult.categories : []).map(
    (categoryItem) => ({
      ...categoryItem,
      productCount: categoryCounts.get(categoryItem.name),
    })
  )

  const hasFilters = Boolean(
    q?.trim() || selectedCategories.length > 0 || sort !== "popular"
  )

  return (
    <>
      <StaffHintBanner staff={staff} />
      <div className="mx-auto w-full max-w-[1440px]">
        <Suspense fallback={<FiltersSkeleton />}>
          <CatalogFilters
            categories={categories}
            initialCategories={selectedCategories}
            initialSort={sort}
          />
        </Suspense>

        <div className="relative z-0 px-4 sm:px-12 lg:px-[194px]">
          <section aria-label="Список товаров" className="w-full max-w-[1053px] pt-3">
            {!catalogResult.ok ? (
              <CatalogError message={catalogResult.message} />
            ) : catalogResult.items.length === 0 ? (
              <CatalogEmpty hasFilters={hasFilters} />
            ) : (
              <Suspense fallback={<GridSkeleton />}>
                <CatalogGrid items={catalogResult.items} />
              </Suspense>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
