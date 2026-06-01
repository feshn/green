import { cn } from "@/lib/utils"

/** Figma Like 659:1899 — 20×20 в hit-area 28×28 (Card 01 price block) */
export function LikeIcon({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/like.svg"
      alt=""
      width={20}
      height={20}
      className={cn("block size-5", className)}
      aria-hidden
    />
  )
}

type ProductLikeStubProps = {
  className?: string
}

export function ProductLikeStub({ className }: ProductLikeStubProps) {
  return (
    <button
      type="button"
      disabled
      title="Избранное — заглушка MVP"
      aria-label="В избранное"
      className={cn("relative size-7 shrink-0 cursor-not-allowed", className)}
    >
      <LikeIcon className="absolute top-1 left-1" />
    </button>
  )
}
