/** Адрес пункта выдачи с городом: «г. Омск, Петропавловская 15» */
export function formatPickupLocation(
  cityName: string | null | undefined,
  address: string | null | undefined
): string | null {
  if (!cityName && !address) return null

  const cityLabel = cityName
    ? cityName.startsWith("г.")
      ? cityName
      : `г. ${cityName}`
    : null

  if (!address) return cityLabel
  if (cityName && address.includes(cityName)) return address
  if (cityLabel) return `${cityLabel}, ${address}`

  return address
}
