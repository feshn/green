import type { SupabaseClient, User } from "@supabase/supabase-js"

import { getClientProfile } from "@/lib/auth/client-profile"
import { normalizePhone } from "@/lib/auth/client-phone"

const INSERT_POLICY_HINT =
  "Выполните в Supabase SQL Editor файл supabase/scripts/hotfix_users_insert_own.sql"

export function phoneFromUserMetadata(user: User): string | null {
  const raw = user.user_metadata?.phone
  if (typeof raw !== "string") return null
  return normalizePhone(raw)
}

/** Создаёт строку users для текущей сессии, если её ещё нет (после успешного 2FA). */
export async function ensureClientUserRow(
  supabase: SupabaseClient,
  user: User,
  phoneOverride?: string | null
): Promise<{ ok: true } | { ok: false; message: string }> {
  const existing = await getClientProfile(supabase, user.id)
  if (existing) return { ok: true }

  const phone = phoneOverride
    ? normalizePhone(phoneOverride)
    : phoneFromUserMetadata(user)

  if (!phone) {
    return {
      ok: false,
      message: "Не найден телефон в сессии. Выйдите и войдите по телефону снова.",
    }
  }

  const { error } = await supabase.from("users").insert({
    id: user.id,
    phone,
    name: null,
    opd_accepted: false,
  })

  if (error) {
    if (error.code === "42501" || error.message.includes("policy")) {
      return {
        ok: false,
        message: `Профиль не создан (RLS). ${INSERT_POLICY_HINT}`,
      }
    }
    if (error.code === "23505") {
      return {
        ok: false,
        message:
          "Этот телефон уже привязан к другому аккаунту. Обратитесь в поддержку или используйте другой номер.",
      }
    }
    return { ok: false, message: error.message }
  }

  return { ok: true }
}
