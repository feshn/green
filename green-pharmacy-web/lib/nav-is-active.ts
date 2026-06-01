/** Активный пункт хедера (профиль / заказы / корзина) */
export function navIsActive(pathname: string, href: string): boolean {
  const path = href.split("?")[0]

  switch (path) {
    case "/profile":
      return (
        pathname === "/profile" ||
        pathname === "/register" ||
        pathname.startsWith("/profile/")
      )
    case "/orders":
      return (
        pathname === "/checkout/success" ||
        pathname === "/orders" ||
        pathname.startsWith("/orders/")
      )
    case "/cart":
      return (
        pathname === "/cart" ||
        pathname === "/checkout" ||
        pathname.startsWith("/cart/")
      )
    case "/":
      return pathname === "/"
    default:
      return pathname === path || pathname.startsWith(`${path}/`)
  }
}
