import Link from "next/link"

import { isStaffRole } from "@/lib/auth/staff-role"

const STAFF_LABELS: Record<string, string> = {
  admin: "администратора",
  picker: "сборщика",
  courier: "курьера",
}

export function StaffHintBanner({ staff }: { staff: string | undefined }) {
  if (!staff || !isStaffRole(staff)) return null

  return (
    <div
      role="status"
      className="border-b border-amber-200/80 bg-amber-50 px-6 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
    >
      Вход для {STAFF_LABELS[staff]} будет в{" "}
      <span className="font-medium">E4</span> (страница Login).{" "}
      <Link href="/" className="underline underline-offset-2">
        Клиентская регистрация
      </Link>
    </div>
  )
}
