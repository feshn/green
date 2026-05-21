import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function PickerPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-display)]">
            Picker
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          staff area — picker
        </CardContent>
      </Card>
    </div>
  )
}
