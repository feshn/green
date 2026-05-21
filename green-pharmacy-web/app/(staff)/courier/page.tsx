import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CourierPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-display)]">
            Courier
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          staff area — courier
        </CardContent>
      </Card>
    </div>
  )
}
