import { PackageOpen, SearchX } from "lucide-react"

type CatalogEmptyProps = {
  hasFilters?: boolean
}

export function CatalogEmpty({ hasFilters }: CatalogEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {hasFilters ? (
        <SearchX className="text-muted-foreground size-10" aria-hidden />
      ) : (
        <PackageOpen className="text-muted-foreground size-10" aria-hidden />
      )}
      <div>
        <p className="font-[family-name:var(--font-display)] text-lg font-medium">
          {hasFilters ? "Ничего не найдено" : "Каталог пуст"}
        </p>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          {hasFilters
            ? "Попробуйте изменить поиск или сбросить фильтры."
            : "Товары появятся после наполнения базы (seed.sql)."}
        </p>
      </div>
    </div>
  )
}

type CatalogErrorProps = {
  message: string
}

export function CatalogError({ message }: CatalogErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center"
    >
      <p className="font-medium text-destructive">Не удалось загрузить каталог</p>
      <p className="text-muted-foreground mt-1 text-sm">{message}</p>
    </div>
  )
}
