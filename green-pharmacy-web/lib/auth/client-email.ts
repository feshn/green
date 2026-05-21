import { normalizePhone } from "@/lib/auth/client-phone"

/** Синтетический email клиента: только цифры, чтобы не пересечься со staff (@test.local). */
export function phoneToClientEmail(phone: string): string | null {
  const normalized = normalizePhone(phone)
  if (!normalized) return null
  const digits = normalized.replace(/\D/g, "")
  return `${digits}@client.green-pharmacy.local`
}
