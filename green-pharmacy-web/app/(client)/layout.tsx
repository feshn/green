export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border px-6 py-4">
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
          Green
        </span>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
