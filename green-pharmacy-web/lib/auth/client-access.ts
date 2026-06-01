import type { ClientSession } from "@/lib/auth/client-session"

export function isLoggedInClient(session: ClientSession): boolean {
  return Boolean(session.user && !session.staffRole && session.isProfileComplete)
}
