"use server"

import { redirect } from "next/navigation"

import { phoneToClientEmail } from "@/lib/auth/client-email"
import { deriveClientPassword } from "@/lib/auth/client-password"
import {
  getClientProfile,
  isProfileComplete,
} from "@/lib/auth/client-profile"
import { normalizePhone } from "@/lib/auth/client-phone"
import { ensureClientUserRow } from "@/lib/auth/ensure-client-user"
import { parseVerifyCodeResult } from "@/lib/auth/verify-code"
import { getStaffRole } from "@/lib/auth/staff-role"
import { createClient } from "@/lib/supabase/server"
import {
  codeSchema,
  phoneSchema,
  profileSchema,
} from "@/lib/validations/registration"

export type AuthActionResult =
  | { ok: true }
  | { ok: false; message: string }

function pepper(): string | null {
  return process.env.CLIENT_AUTH_PEPPER?.trim() || null
}

export async function requestAuthCodeAction(
  rawPhone: string
): Promise<AuthActionResult> {
  const parsed = phoneSchema.safeParse(rawPhone)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Некорректный телефон" }
  }

  const phone = normalizePhone(parsed.data)
  if (!phone) {
    return { ok: false, message: "Некорректный номер телефона" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("request_auth_code", {
    p_phone: phone,
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  if (data !== "ОТПРАВЛЕНО") {
    return {
      ok: false,
      message: data === "НЕВЕРНЫЙ_ТЕЛЕФОН" ? "Некорректный телефон" : String(data),
    }
  }

  return { ok: true }
}

async function establishClientSession(phone: string): Promise<AuthActionResult> {
  const secret = pepper()
  if (!secret) {
    return {
      ok: false,
      message:
        "Не задан CLIENT_AUTH_PEPPER в .env.local (серверная переменная для сессии после 2FA).",
    }
  }

  const email = phoneToClientEmail(phone)
  const password = deriveClientPassword(phone, secret)
  if (!email || !password) {
    return { ok: false, message: "Не удалось подготовить учётную запись" }
  }

  const supabase = await createClient()

  const signIn = await supabase.auth.signInWithPassword({ email, password })
  if (signIn.error && signIn.error.message !== "Invalid login credentials") {
    return { ok: false, message: signIn.error.message }
  }

  if (!signIn.error && signIn.data.user) {
    return { ok: true }
  }

  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: { data: { phone } },
  })

  if (signUp.error) {
    if (
      signUp.error.message.toLowerCase().includes("already") ||
      signUp.error.message.toLowerCase().includes("registered")
    ) {
      const retry = await supabase.auth.signInWithPassword({ email, password })
      if (retry.error) {
        return { ok: false, message: retry.error.message }
      }
      return { ok: true }
    }
    return { ok: false, message: signUp.error.message }
  }

  if (signUp.data.user && !signUp.data.session) {
    const retry = await supabase.auth.signInWithPassword({ email, password })
    if (retry.error) {
      return {
        ok: false,
        message:
          "Пользователь создан, но сессия не открыта. Отключите подтверждение email в Supabase Auth или войдите повторно.",
      }
    }
  }

  return { ok: true }
}

export type VerifyCodeActionResult =
  | { ok: true; needsProfile: boolean }
  | {
      ok: false
      message: string
      variant?: "wrong" | "blocked" | "expired" | "unknown"
      attemptsLeft?: number | null
    }

export async function verifyCodeAndSignInAction(
  rawPhone: string,
  rawCode: string
): Promise<VerifyCodeActionResult> {
  const phoneParsed = phoneSchema.safeParse(rawPhone)
  const codeParsed = codeSchema.safeParse(rawCode)
  if (!phoneParsed.success) {
    return { ok: false, message: "Некорректный телефон", variant: "unknown" }
  }
  if (!codeParsed.success) {
    return { ok: false, message: "Введите 6 цифр кода", variant: "unknown" }
  }

  const phone = normalizePhone(phoneParsed.data)
  if (!phone) {
    return { ok: false, message: "Некорректный телефон", variant: "unknown" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("verify_user_code", {
    user_phone: phone,
    input_code: codeParsed.data,
  })

  if (error) {
    return { ok: false, message: error.message, variant: "unknown" }
  }

  const outcome = parseVerifyCodeResult(data as string | null)
  if (outcome.status !== "success") {
    return {
      ok: false,
      message: outcome.message,
      variant: outcome.status === "wrong" ? "wrong" : outcome.status,
      attemptsLeft:
        outcome.status === "wrong" ? outcome.attemptsLeft : undefined,
    }
  }

  const sessionResult = await establishClientSession(phone)
  if (!sessionResult.ok) {
    return { ok: false, message: sessionResult.message, variant: "unknown" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: "Сессия не создана", variant: "unknown" }
  }

  const staffRole = await getStaffRole(supabase, user.email)
  if (staffRole) {
    await supabase.auth.signOut()
    return {
      ok: false,
      message: "Этот вход предназначен для клиентов. Staff — в E4.",
      variant: "unknown",
    }
  }

  const ensured = await ensureClientUserRow(supabase, user, phone)
  if (!ensured.ok) {
    return { ok: false, message: ensured.message, variant: "unknown" }
  }

  const profile = await getClientProfile(supabase, user.id)
  if (!profile) {
    return {
      ok: false,
      message: "Профиль не создан. Обновите страницу или войдите снова.",
      variant: "unknown",
    }
  }

  return { ok: true, needsProfile: !isProfileComplete(profile) }
}

export async function saveClientProfileAction(
  name: string,
  opdAccepted: boolean
): Promise<AuthActionResult> {
  const parsed = profileSchema.safeParse({ name, opdAccepted })
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Проверьте форму",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Войдите по телефону" }
  }

  const staffRole = await getStaffRole(supabase, user.email)
  if (staffRole) {
    return { ok: false, message: "Недоступно для учётной записи персонала" }
  }

  let profile = await getClientProfile(supabase, user.id)
  if (!profile) {
    const ensured = await ensureClientUserRow(supabase, user)
    if (!ensured.ok) {
      return { ok: false, message: ensured.message }
    }
    profile = await getClientProfile(supabase, user.id)
  }
  if (!profile) {
    return { ok: false, message: "Профиль не найден. Пройдите вход заново." }
  }

  const { error } = await supabase
    .from("users")
    .update({
      name: parsed.data.name,
      opd_accepted: parsed.data.opdAccepted,
    })
    .eq("id", user.id)

  if (error) {
    return { ok: false, message: error.message }
  }

  return { ok: true }
}

export async function signOutClientAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/register")
}
