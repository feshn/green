import Image from "next/image"
import Link from "next/link"

/** Figma Head / Logo — 139×40 */
export function EvergreenLogo() {
  return (
    <Link href="/" className="relative block h-10 w-[139px] shrink-0">
      <Image
        src="/icons/logo.svg"
        alt="evergreen"
        width={139}
        height={40}
        priority
        className="size-full object-contain"
      />
    </Link>
  )
}
