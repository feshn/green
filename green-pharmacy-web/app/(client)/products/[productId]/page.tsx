import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ShoppingCart } from "lucide-react"

import { StaffHintBanner } from "@/components/auth/staff-hint-banner"
import { ProductLikeStub } from "@/components/icons/like-icon"
import { ProductGallery } from "@/components/catalog/product-gallery"
import { ProductInfoColumn } from "@/components/catalog/product-info-column"
import { ProductRecommendedSection } from "@/components/catalog/product-recommended-section"
import { getClientSession } from "@/lib/auth/client-session"
import { buildGalleryImages } from "@/lib/catalog/gallery-images"
import { formatPrice } from "@/lib/catalog/format"
import {
  fetchCatalogItem,
  fetchProductCategoryChips,
  fetchProductDetails,
  fetchProductImages,
  fetchRecommendedForCategory,
} from "@/lib/catalog/queries"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ staff?: string }>
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { productId: rawId } = await params
  const { staff } = await searchParams
  const productId = Number.parseInt(rawId, 10)

  if (!Number.isFinite(productId) || productId <= 0) {
    notFound()
  }

  const supabase = await createClient()
  const session = await getClientSession(supabase)

  if (session.staffRole) {
    redirect(`/${session.staffRole}`)
  }

  if (session.user && !session.isProfileComplete) {
    redirect("/register")
  }

  const [item, details, images, categoryChips] = await Promise.all([
    fetchCatalogItem(supabase, productId),
    fetchProductDetails(supabase, productId),
    fetchProductImages(supabase, productId),
    fetchProductCategoryChips(supabase, productId),
  ])

  if (!item) {
    notFound()
  }

  const chipNames =
    categoryChips.length > 0
      ? categoryChips.map((c) => c.name)
      : item.category_name
        ? [item.category_name]
        : []

  const firstCategory = chipNames[0] ?? ""
  const recommended = firstCategory
    ? await fetchRecommendedForCategory(supabase, firstCategory, productId)
    : []

  const galleryImages = buildGalleryImages(images, {
    previewImage: item.preview_image,
    mainImageUrl: details?.main_image_url,
  })

  return (
    <>
      <StaffHintBanner staff={staff} />
      <div className="mx-auto w-full max-w-[1053px] flex-1 px-4 py-6 sm:px-6 lg:px-0">
        <nav
          aria-label="Хлебные крошки"
          className="mb-4 flex flex-wrap items-center gap-1 text-[13px] tracking-[-0.13px] text-neutral-50"
        >
          <Link href="/" className="hover:text-neutral-100">
            Главная
          </Link>
          <span className="text-neutral-30">\</span>
          <span className="line-clamp-1 text-neutral-50">{item.product_name}</span>
        </nav>

        <div className="grid gap-x-6 lg:grid-cols-[346px_minmax(0,1fr)] lg:items-start">
          <ProductGallery
            images={galleryImages}
            productName={item.product_name}
            className="lg:row-span-2"
          />

          <ProductInfoColumn
            productName={item.product_name}
            chipNames={chipNames}
            details={details}
            pricePanel={
              <div className="rounded-xl bg-white p-3">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xl font-bold tracking-[-0.6px] text-neutral-100">
                      {formatPrice(item.current_price)}
                    </p>
                    {item.old_price != null && item.old_price > item.current_price ? (
                      <p className="text-[17px] font-medium tracking-[-0.51px] text-neutral-50 line-through">
                        {formatPrice(item.old_price)}
                      </p>
                    ) : null}
                  </div>
                  <ProductLikeStub />
                </div>
                <button
                  type="button"
                  disabled
                  title="Добавление в корзину — E3"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-green font-display text-sm font-bold text-white opacity-60"
                >
                  <ShoppingCart className="size-4" aria-hidden />
                  В корзину
                </button>
              </div>
            }
          />
        </div>

        <ProductRecommendedSection
          categoryName={firstCategory}
          items={recommended}
        />
      </div>
    </>
  )
}
