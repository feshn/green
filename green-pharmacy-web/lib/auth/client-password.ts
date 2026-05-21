import { createHash } from "node:crypto"

import { normalizePhone } from "@/lib/auth/client-phone"

/** Детерминированный пароль для signIn/signUp после 2FA (только на сервере). */
export function deriveClientPassword(phone: string, pepper: string): string | null {
  const normalized = normalizePhone(phone)
  if (!normalized || !pepper) return null
  return createHash("sha256")
    .update(`${normalized}:${pepper}`)
    .digest("hex")
    .slice(0, 32)
}
