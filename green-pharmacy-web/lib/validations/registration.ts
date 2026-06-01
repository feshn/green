import { z } from "zod"

/** Только цифры, последние 10 — национальный номер без +7 */
export function toPhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(-10)
}

export const phoneSchema = z
  .string()
  .transform(toPhoneDigits)
  .pipe(
    z
      .string()
      .length(10, "Нужно 10 цифр номера")
      .regex(/^\d{10}$/, "Некорректный ввод")
  )

export const codeSchema = z
  .string()
  .length(6, "Код — 6 цифр")
  .regex(/^\d{6}$/, "Только цифры")

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80)
    .superRefine((val, ctx) => {
      const letters = val.replace(/[^\p{L}]/gu, "")
      if (letters.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Укажите имя",
        })
        return
      }
      if (letters.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Имя должно содержать минимум 2 буквы",
        })
      }
    }),
  opdAccepted: z
    .boolean()
    .refine((v) => v, "Нужно согласие на обработку персональных данных"),
})

export const phoneFormSchema = z.object({
  phone: phoneSchema,
})

export const codeFormSchema = z.object({
  code: codeSchema,
})

export type PhoneFormValues = z.infer<typeof phoneFormSchema>
export type CodeFormValues = z.infer<typeof codeFormSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
