export type VerifyCodeOutcome =
  | { status: "success" }
  | { status: "wrong"; attemptsLeft: number | null; message: string }
  | { status: "blocked"; message: string }
  | { status: "expired"; message: string }
  | { status: "unknown"; message: string }

export function parseVerifyCodeResult(raw: string | null): VerifyCodeOutcome {
  if (!raw) {
    return { status: "unknown", message: "Пустой ответ сервера" }
  }

  if (raw === "УСПЕШНО") {
    return { status: "success" }
  }

  if (raw.startsWith("НЕВЕРНО_ОСТАЛОСЬ_ПОПЫТОК:")) {
    const part = raw.split(":")[1]?.trim()
    const attemptsLeft = part ? Number.parseInt(part, 10) : null
    return {
      status: "wrong",
      attemptsLeft: Number.isFinite(attemptsLeft) ? attemptsLeft : null,
      message: "Неверный код",
    }
  }

  if (
    raw === "КОД_ЗАБЛОКИРОВАН_ПРЕВЫШЕНЫ_ПОПЫТКИ" ||
    raw === "КОД_АННУЛИРОВАН_НАЖМИТЕ_ПОВТОРНО"
  ) {
    return { status: "blocked", message: "Превышено число попыток. Запросите код снова." }
  }

  if (raw === "КОД_НЕ_НАЙДЕН_ИЛИ_ИСТЕК") {
    return { status: "expired", message: "Код не найден или истёк. Запросите новый." }
  }

  return { status: "unknown", message: raw }
}
