/** Нормализованный телефон для RPC: +7XXXXXXXXXX */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length < 10) return null

  let national = digits
  if (national.length === 11 && national.startsWith("8")) {
    national = "7" + national.slice(1)
  } else if (national.length === 10) {
    national = "7" + national
  } else if (national.length === 11 && national.startsWith("7")) {
    // ok
  } else {
    return null
  }

  if (national.length !== 11 || !national.startsWith("7")) return null
  return `+${national}`
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  const n = digits.length === 11 ? digits.slice(1) : digits.slice(-10)
  if (n.length !== 10) return phone
  return `+7 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6, 8)}-${n.slice(8, 10)}`
}
