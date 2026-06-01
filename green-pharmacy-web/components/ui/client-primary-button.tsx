import Link from "next/link"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** Figma L Button XL — Default / Hover / Pressed / Disabled (444:6363, 470:456–468) */
export const clientPrimaryButtonClassName = "ui-client-primary"

type ClientPrimaryButtonProps = ComponentProps<"button">

export function ClientPrimaryButton({
  className,
  type = "button",
  ...props
}: ClientPrimaryButtonProps) {
  return (
    <button
      type={type}
      className={cn(clientPrimaryButtonClassName, className)}
      {...props}
    />
  )
}

type ClientPrimaryLinkProps = ComponentProps<typeof Link>

export function ClientPrimaryLink({ className, ...props }: ClientPrimaryLinkProps) {
  return (
    <Link className={cn(clientPrimaryButtonClassName, className)} {...props} />
  )
}
