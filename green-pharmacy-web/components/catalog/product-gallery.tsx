"use client"

import { useCallback, useMemo, useRef, useState } from "react"

import {
  IconCarouselChevronLeft,
  IconCarouselChevronRight,
} from "@/components/icons/carousel-chevron"
import type { GalleryImage } from "@/lib/catalog/gallery-images"
import { resolveGalleryThumb } from "@/lib/catalog/demo-image-paths"
import { cn } from "@/lib/utils"

type ProductGalleryProps = {
  images: GalleryImage[]
  productName: string
  className?: string
}

const THUMB_STEP = 80

/** Figma Carousel 628:1353 */
export function ProductGallery({
  images,
  productName,
  className,
}: ProductGalleryProps) {
  const list = useMemo(
    () =>
      images
        .filter((img) => img.url.trim())
        .map((img) => ({
          ...img,
          thumbUrl: img.thumbUrl ?? resolveGalleryThumb(img.url),
        })),
    [images]
  )

  const [active, setActive] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const safeActive = list.length > 0 ? Math.min(active, list.length - 1) : 0
  const current = list[safeActive]
  const canGoPrev = safeActive > 0
  const canGoNext = safeActive < list.length - 1

  const scrollThumbs = useCallback(
    (direction: -1 | 1) => {
      const next = Math.max(0, Math.min(list.length - 1, safeActive + direction))
      setActive(next)
      scrollRef.current?.scrollTo({
        left: next * THUMB_STEP,
        behavior: "smooth",
      })
    },
    [list.length, safeActive]
  )

  return (
    <div className={cn("flex w-full max-w-[346px] flex-col items-end gap-3", className)}>
      <div className="relative flex h-[327px] w-full items-center justify-center overflow-hidden rounded-2xl bg-white">
        {current?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={productName}
            className="h-auto max-h-[299px] w-auto max-w-[299px] object-contain mix-blend-luminosity"
          />
        ) : (
          <div className="text-neutral-50">Нет фото</div>
        )}
      </div>

      {list.length > 1 ? (
        <div
          className="group/carousel relative w-[346px] overflow-clip"
          role="region"
          aria-label="Карусель фото"
        >
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
          >
            {list.map((img, idx) => (
              <button
                key={`${img.url}-${idx}`}
                type="button"
                role="tab"
                aria-selected={safeActive === idx}
                aria-label={`Фото ${idx + 1}`}
                onClick={() => setActive(idx)}
                className={cn(
                  "flex h-[60px] w-[72px] shrink-0 items-start rounded-xl bg-white px-3 py-1.5",
                  safeActive === idx
                    ? "border-2 border-solid border-[#3f96df]"
                    : "border-2 border-transparent"
                )}
              >
                <span className="relative size-12 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.thumbUrl ?? img.url}
                    alt=""
                    className="absolute top-0.5 left-0.5 size-[45px] object-cover mix-blend-luminosity"
                  />
                </span>
              </button>
            ))}
          </div>

          {canGoPrev ? (
            <div className="pointer-events-none absolute top-0 left-0 h-[60px] w-7 opacity-0 transition-opacity group-hover/carousel:pointer-events-auto group-hover/carousel:opacity-100">
              <div className="absolute top-0 left-0 h-[60px] w-7 rounded-xl bg-white" />
              <div className="absolute top-3.5 -left-0.5 size-8 overflow-clip">
                <IconCarouselChevronLeft />
              </div>
              <button
                type="button"
                aria-label="Предыдущее фото"
                onClick={() => scrollThumbs(-1)}
                className="absolute inset-0 z-10 rounded-xl"
              />
            </div>
          ) : null}

          {canGoNext ? (
            <div className="pointer-events-none absolute top-0 right-0 h-[60px] w-7 opacity-0 transition-opacity group-hover/carousel:pointer-events-auto group-hover/carousel:opacity-100">
              <div className="absolute top-0 left-0 h-[60px] w-7 rounded-xl bg-white" />
              <div className="absolute top-3.5 -left-0.5 size-8 overflow-clip">
                <IconCarouselChevronRight />
              </div>
              <button
                type="button"
                aria-label="Следующее фото"
                onClick={() => scrollThumbs(1)}
                className="absolute inset-0 z-10 rounded-xl"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
