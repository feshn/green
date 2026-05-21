import { z } from "zod"

export const phoneSchema = z
  .string()
  .min(10, "Введите номер телефона")
  .transform((v) => v.replace(/\D/g, ""))
  .refine((digits) => digits.length >= 10 && digits.length <= 11, {
    message: "Некорректный номер",
  })

export const codeSchema = z
  .string()
  .length(6, "Код — 6 цифр")
  .regex(/^\d{6}$/, "Только цифры")

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80),
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
