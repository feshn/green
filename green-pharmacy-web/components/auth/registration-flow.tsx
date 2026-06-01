"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { CodeSegmentInput } from "@/components/auth/code-segment-input"
import { PhoneMaskInput } from "@/components/auth/phone-mask-input"
import {
  requestAuthCodeAction,
  saveClientProfileAction,
  verifyCodeAndSignInAction,
} from "@/lib/auth/client-actions"
import {
  formatPhoneRegistration,
  normalizePhone,
} from "@/lib/auth/client-phone"
import {
  codeFormSchema,
  phoneFormSchema,
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/registration"
import { Checkbox } from "@/components/ui/checkbox"
import {
  TEXT_FIELD_ERROR_SLOT_CLASS,
  TextField,
  TextFieldInput,
} from "@/components/ui/text-field"
import { cn } from "@/lib/utils"

const PHONE_STORAGE_KEY = "green-reg-phone"

export type RegistrationStep = "phone" | "code" | "profile"

type RegistrationFlowProps = {
  initialStep: RegistrationStep
  initialPhone?: string
}

const PRIMARY_BTN_CLASS =
  "flex h-11 w-full items-center justify-center rounded-lg bg-brand-green px-3 font-display text-sm font-bold leading-4 text-white transition-colors disabled:cursor-not-allowed disabled:bg-brand-green-disabled"

export function RegistrationFlow({
  initialStep,
  initialPhone = "",
}: RegistrationFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<RegistrationStep>(initialStep)
  const [phone, setPhone] = useState(initialPhone)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const phoneForm = useForm<{ phone: string }>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phone: "" },
  })

  const codeForm = useForm<{ code: string }>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: { code: "" },
  })

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", opdAccepted: false },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  })

  const phoneDigits = phoneForm.watch("phone")
  const codeValue = codeForm.watch("code")
  const opdAccepted = profileForm.watch("opdAccepted")
  const phoneFieldError = phoneForm.formState.errors.phone?.message
  const codeFieldError =
    codeForm.formState.isSubmitted
      ? codeForm.formState.errors.code?.message
      : undefined
  const nameFieldError =
    profileForm.formState.isSubmitted
      ? profileForm.formState.errors.name?.message
      : undefined
  const opdFieldError =
    profileForm.formState.isSubmitted
      ? profileForm.formState.errors.opdAccepted?.message
      : undefined
  const profileRootError = profileForm.formState.errors.root?.message
  const consentAlert = opdFieldError || profileRootError

  useEffect(() => {
    const stored = sessionStorage.getItem(PHONE_STORAGE_KEY)
    if (!stored) return
    setPhone((current) => current || stored)
    const digits = stored.replace(/\D/g, "").slice(-10)
    if (digits.length === 10) {
      phoneForm.setValue("phone", digits)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const persistPhone = useCallback((value: string) => {
    setPhone(value)
    if (typeof window !== "undefined") {
      sessionStorage.setItem(PHONE_STORAGE_KEY, value)
    }
  }, [])

  const goToPhoneStep = useCallback(() => {
    setStep("phone")
    setCodeError(null)
    setAttemptsLeft(null)
    codeForm.reset({ code: "" })
    const digits = phone.replace(/\D/g, "").slice(-10)
    if (digits.length === 10) {
      phoneForm.setValue("phone", digits, { shouldValidate: false })
    }
  }, [codeForm, phone, phoneForm])

  const onRequestCode = phoneForm.handleSubmit(async ({ phone: digits }) => {
    setBusy(true)
    setCodeError(null)
    const result = await requestAuthCodeAction(digits)
    setBusy(false)
    if (!result.ok) {
      phoneForm.setError("phone", { message: result.message })
      return
    }
    const normalized = normalizePhone(digits)
    if (!normalized) {
      phoneForm.setError("phone", { message: "Некорректный номер телефона" })
      return
    }
    persistPhone(normalized)
    codeForm.reset({ code: "" })
    setResendCooldown(60)
    setStep("code")
  })

  const onVerifyCode = codeForm.handleSubmit(async ({ code }) => {
    setBusy(true)
    setCodeError(null)
    const result = await verifyCodeAndSignInAction(phone, code)
    setBusy(false)

    if (!result.ok) {
      setCodeError(result.message)
      if (result.attemptsLeft != null) {
        setAttemptsLeft(result.attemptsLeft)
      }
      return
    }

    if (result.needsProfile) {
      setStep("profile")
      return
    }

    router.replace("/")
  })

  const onResend = async () => {
    if (resendCooldown > 0 || !phone) return
    setBusy(true)
    const result = await requestAuthCodeAction(phone)
    setBusy(false)
    if (!result.ok) {
      setCodeError(result.message)
      return
    }
    setCodeError(null)
    setAttemptsLeft(null)
    setResendCooldown(60)
  }

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    setBusy(true)
    const result = await saveClientProfileAction(values.name, values.opdAccepted)
    setBusy(false)
    if (!result.ok) {
      profileForm.setError("root", { message: result.message })
      return
    }
    sessionStorage.removeItem(PHONE_STORAGE_KEY)
    router.replace("/")
  })

  if (step === "phone") {
    return (
      <form onSubmit={onRequestCode} className="mx-auto w-full max-w-[372px]">
        <div className="flex h-[282px] flex-col justify-between">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-[30px] leading-9 font-bold text-neutral-100">
              Вход по номеру
              <br />
              мобильного телефона
            </h1>
            <TextField
              label="Телефон"
              htmlFor="phone"
              error={phoneFieldError}
            >
              <PhoneMaskInput
                id="phone"
                value={phoneDigits}
                onChange={(digits) => {
                  phoneForm.setValue("phone", digits, { shouldValidate: false })
                  phoneForm.clearErrors("phone")
                }}
                onBlur={() => phoneForm.trigger("phone")}
                hasError={Boolean(phoneFieldError)}
                disabled={busy}
              />
            </TextField>
          </div>
          <button
            type="submit"
            className={PRIMARY_BTN_CLASS}
            disabled={busy || phoneDigits.length !== 10}
          >
            {busy ? "Отправка…" : "Получить код"}
          </button>
        </div>
      </form>
    )
  }

  if (step === "code") {
    const alertText = codeError
      ? `${codeError}${attemptsLeft != null ? ` Осталось попыток: ${attemptsLeft}.` : ""}`
      : codeFieldError || null

    return (
      <form onSubmit={onVerifyCode} className="mx-auto w-full max-w-[376px]">
        <div className="flex h-[282px] flex-col justify-between">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-[30px] leading-9 font-bold text-neutral-100">
                Код из смс
              </h1>
              <p className="text-base leading-6 font-medium text-neutral-50">
                Отправили на номер {formatPhoneRegistration(phone)}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <CodeSegmentInput
                  value={codeValue}
                  onChange={(value) => {
                    codeForm.setValue("code", value, { shouldValidate: false })
                    codeForm.clearErrors("code")
                    setCodeError(null)
                  }}
                  hasError={Boolean(alertText)}
                  disabled={busy}
                />
                <p
                  className={cn(
                    TEXT_FIELD_ERROR_SLOT_CLASS,
                    alertText ? "text-destructive" : "text-transparent"
                  )}
                  role={alertText ? "alert" : undefined}
                >
                  {alertText || "Неверный код"}
                </p>
              </div>
              <button
                type="button"
                className="self-start py-2 pr-2 text-[13px] leading-4 font-semibold text-neutral-100 underline underline-offset-2 disabled:opacity-50"
                disabled={busy || resendCooldown > 0}
                onClick={onResend}
              >
                {resendCooldown > 0
                  ? `Запросить повторно (${resendCooldown} с)`
                  : "Запросить повторно"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-neutral-100"
              onClick={goToPhoneStep}
              aria-label="Назад"
            >
              <ArrowLeft className="size-6" aria-hidden />
            </button>
            <button
              type="submit"
              className={cn(PRIMARY_BTN_CLASS, "flex-1")}
              disabled={busy || codeValue.length !== 6}
            >
              {busy ? "Проверка…" : "Продолжить"}
            </button>
          </div>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={onSaveProfile} className="mx-auto w-full max-w-[372px]">
      <div className="flex h-[282px] flex-col justify-between">
        <div className="flex h-[178px] flex-col justify-between">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-[30px] leading-9 font-bold text-neutral-100">
              Как к вам обращаться?
            </h1>
            <TextField label="Ваше имя" htmlFor="name" error={nameFieldError}>
              <TextFieldInput
                id="name"
                autoComplete="name"
                placeholder="Как к вам обращаться"
                hasError={Boolean(nameFieldError)}
                disabled={busy}
                {...profileForm.register("name", {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(
                      /[^\p{L}\s-]/gu,
                      ""
                    )
                  },
                })}
              />
            </TextField>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Checkbox
                id="opd"
                checked={opdAccepted}
                hasError={Boolean(opdFieldError) && !opdAccepted}
                onCheckedChange={(checked) => {
                  profileForm.setValue("opdAccepted", checked === true, {
                    shouldValidate: false,
                  })
                  if (checked === true) {
                    profileForm.clearErrors("opdAccepted")
                  }
                }}
              />
              <label
                htmlFor="opd"
                className="cursor-pointer text-[13px] leading-4 font-medium text-neutral-50"
              >
                Согласие на обработку персональных данных
              </label>
            </div>
            <p
              className={cn(
                TEXT_FIELD_ERROR_SLOT_CLASS,
                consentAlert ? "text-destructive" : "text-transparent"
              )}
              role={consentAlert ? "alert" : undefined}
            >
              {consentAlert || "Нужно согласие"}
            </p>
          </div>
        </div>

        <button type="submit" className={PRIMARY_BTN_CLASS} disabled={busy}>
          {busy ? "Сохранение…" : "Зарегистрироваться"}
        </button>
      </div>
    </form>
  )
}
