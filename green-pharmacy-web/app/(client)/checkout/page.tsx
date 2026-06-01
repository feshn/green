import { redirect } from "next/navigation"

type PageProps = {
  searchParams: Promise<{ staff?: string }>
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const { staff } = await searchParams
  const query = staff ? `?staff=${encodeURIComponent(staff)}` : ""
  redirect(`/cart${query}#payment`)
}
