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

/** Figma Registration 02: «+7 985 352-23-31» */
export function formatPhoneRegistration(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10)
  if (digits.length !== 10) return phone
  return `+7 ${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
}

/** Частичный формат без плейсхолдеров: «985 352-23» */
export function formatPhonePartial(digits: string): string {
  if (!digits) return ""
  const s = digits.slice(0, 10)
  let result = s.slice(0, 3)
  if (s.length > 3) result += ` ${s.slice(3, 6)}`
  if (s.length > 6) result += `-${s.slice(6, 8)}`
  if (s.length > 8) result += `-${s.slice(8, 10)}`
  return result
}

/** Символы маски «000 000-00-00» с разделителями для отображения в поле */
export function getPhoneMaskCharacters(digits: string): { char: string; filled: boolean }[] {
  const groups: Array<{ sep?: string; indices: number[] }> = [
    { indices: [0, 1, 2] },
    { sep: " ", indices: [3, 4, 5] },
    { sep: "-", indices: [6, 7] },
    { sep: "-", indices: [8, 9] },
  ]

  const result: { char: string; filled: boolean }[] = []
  for (const group of groups) {
    if (group.sep) {
      result.push({ char: group.sep, filled: true })
    }
    for (const index of group.indices) {
      const digit = digits[index]
      result.push(
        digit ? { char: digit, filled: true } : { char: "0", filled: false }
      )
    }
  }
  return result
}
