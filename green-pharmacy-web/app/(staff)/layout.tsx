import { Separator } from "@/components/ui/separator"

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted/30">
      <header className="border-b border-border bg-background px-6 py-3">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Green — персонал
        </p>
      </header>
      <Separator />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
