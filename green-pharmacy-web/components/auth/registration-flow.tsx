"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  requestAuthCodeAction,
  saveClientProfileAction,
  verifyCodeAndSignInAction,
} from "@/lib/auth/client-actions"
import { formatPhoneDisplay, normalizePhone } from "@/lib/auth/client-phone"
import {
  codeFormSchema,
  phoneFormSchema,
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/registration"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const PHONE_STORAGE_KEY = "green-reg-phone"

export type RegistrationStep = "phone" | "code" | "profile"

type RegistrationFlowProps = {
  initialStep: RegistrationStep
  initialPhone?: string
}

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
    defaultValues: { phone: initialPhone },
  })

  const codeForm = useForm<{ code: string }>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: { code: "" },
  })

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", opdAccepted: false },
  })

  useEffect(() => {
    const stored = sessionStorage.getItem(PHONE_STORAGE_KEY)
    if (!stored) return
    setPhone((current) => current || stored)
    const digits = stored.replace(/\D/g, "").slice(-10)
    if (digits.length === 10) {
      phoneForm.setValue("phone", digits)
    }
    // Только при монтировании: phoneForm в deps вызывал бесконечный re-render («Rendering…»).
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

  const onRequestCode = phoneForm.handleSubmit(async ({ phone: raw }) => {
    setBusy(true)
    setCodeError(null)
    const result = await requestAuthCodeAction(raw)
    setBusy(false)
    if (!result.ok) {
      phoneForm.setError("phone", { message: result.message })
      return
    }
    const normalized = normalizePhone(raw)
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

  const stepTitle =
    step === "phone"
      ? "Вход по телефону"
      : step === "code"
        ? "Код из SMS"
        : "Ваш профиль"

  const stepDescription =
    step === "phone"
      ? "Registration 01 — мы отправим одноразовый код (в MVP код в таблице auth_codes)."
      : step === "code"
        ? codeError
          ? "Registration 03 — неверный код."
          : "Registration 02 — введите 6 цифр."
        : "Registration 04 — имя и согласие на обработку данных."

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-display)] text-2xl">
          {stepTitle}
        </CardTitle>
        <CardDescription>{stepDescription}</CardDescription>
        {step !== "phone" && phone ? (
          <p className="text-muted-foreground text-sm">
            {formatPhoneDisplay(phone)}
            {step === "code" ? (
              <button
                type="button"
                className="text-primary ml-2 underline underline-offset-2"
                onClick={() => {
                  setStep("phone")
                  setCodeError(null)
                  setPhone("")
                  codeForm.reset({ code: "" })
                  if (typeof window !== "undefined") {
                    sessionStorage.removeItem(PHONE_STORAGE_KEY)
                  }
                }}
              >
                Изменить
              </button>
            ) : null}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "phone" ? (
          <form onSubmit={onRequestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <div className="flex gap-2">
                <span className="text-muted-foreground flex h-8 items-center rounded-lg border border-input px-2.5 text-sm">
                  +7
                </span>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="900 000-00-00"
                  aria-invalid={!!phoneForm.formState.errors.phone}
                  {...phoneForm.register("phone")}
                />
              </div>
              {phoneForm.formState.errors.phone ? (
                <p className="text-destructive text-sm">
                  {phoneForm.formState.errors.phone.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Отправка…" : "Получить код"}
            </Button>
          </form>
        ) : null}

        {step === "code" ? (
          <form onSubmit={onVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код подтверждения</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className={cn(
                  "tracking-[0.4em] text-center font-mono text-lg",
                  codeError && "border-destructive"
                )}
                aria-invalid={!!codeError || !!codeForm.formState.errors.code}
                {...codeForm.register("code", {
                  onChange: (e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6)
                    e.target.value = v
                    codeForm.setValue("code", v)
                  },
                })}
              />
              {codeForm.formState.errors.code ? (
                <p className="text-destructive text-sm">
                  {codeForm.formState.errors.code.message}
                </p>
              ) : null}
              {codeError ? (
                <p className="text-destructive text-sm" role="alert">
                  {codeError}
                  {attemptsLeft != null
                    ? ` Осталось попыток: ${attemptsLeft}.`
                    : null}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Проверка…" : "Подтвердить"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={busy || resendCooldown > 0}
              onClick={onResend}
            >
              {resendCooldown > 0
                ? `Отправить снова (${resendCooldown} с)`
                : "Отправить код снова"}
            </Button>
          </form>
        ) : null}

        {step === "profile" ? (
          <form onSubmit={onSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Как к вам обращаться"
                aria-invalid={!!profileForm.formState.errors.name}
                {...profileForm.register("name")}
              />
              {profileForm.formState.errors.name ? (
                <p className="text-destructive text-sm">
                  {profileForm.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="opd"
                checked={profileForm.watch("opdAccepted")}
                onCheckedChange={(checked) =>
                  profileForm.setValue("opdAccepted", checked === true, {
                    shouldValidate: true,
                  })
                }
              />
              <Label htmlFor="opd" className="font-normal leading-snug">
                Согласен(на) на обработку персональных данных (ОПД)
              </Label>
            </div>
            {profileForm.formState.errors.opdAccepted ? (
              <p className="text-destructive text-sm">
                {profileForm.formState.errors.opdAccepted.message}
              </p>
            ) : null}
            {profileForm.formState.errors.root ? (
              <p className="text-destructive text-sm" role="alert">
                {profileForm.formState.errors.root.message}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Сохранение…" : "Продолжить"}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}
