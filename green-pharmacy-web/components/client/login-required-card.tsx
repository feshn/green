import Link from "next/link"
import { LogIn } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type LoginRequiredCardProps = {
  title: string
  description?: string
}

export function LoginRequiredCard({
  title,
  description = "Войдите по номеру телефона, чтобы открыть этот раздел.",
}: LoginRequiredCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-display)]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            <LogIn className="size-4" aria-hidden />
            Войти
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
