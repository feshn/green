import { cn } from "@/lib/utils"

type ClientPageHeaderProps = {
  title: string
  className?: string
}

/**
 * Figma Surface (348:1857): 32px от главного хедера до заголовка,
 * 20px от заголовка до контента страницы (mt-5 на соседнем блоке).
 */
export function ClientPageHeader({ title, className }: ClientPageHeaderProps) {
  return (
    <h1
      className={cn(
        "pt-8 font-display text-2xl leading-[28px] font-bold tracking-[0.24px] text-neutral-100",
        className
      )}
    >
      {title}
    </h1>
  )
}
