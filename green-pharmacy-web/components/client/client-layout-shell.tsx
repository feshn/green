"use client"

import { usePathname } from "next/navigation"

import { ClientHeader } from "@/components/client/client-header"
import type { ClientSession } from "@/lib/auth/client-session"

type ClientLayoutShellProps = {
  session: ClientSession
  children: React.ReactNode
}

export function ClientLayoutShell({ session, children }: ClientLayoutShellProps) {
  const pathname = usePathname()
  const hideHeader = pathname === "/register"

  return (
    <div className="flex min-h-full flex-1 flex-col bg-page">
      {!hideHeader ? <ClientHeader session={session} /> : null}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
