import { Suspense } from "react"

import { ClientLayoutShell } from "@/components/client/client-layout-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { getClientSession } from "@/lib/auth/client-session"
import { createClient } from "@/lib/supabase/server"

function ShellSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-page">
      <header className="h-[72px] bg-brand-header px-6" />
      <Skeleton className="m-6 h-40 w-full max-w-4xl" />
    </div>
  )
}

async function ClientShellLoader({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const session = await getClientSession(supabase)
  return <ClientLayoutShell session={session}>{children}</ClientLayoutShell>
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <ClientShellLoader>{children}</ClientShellLoader>
    </Suspense>
  )
}
