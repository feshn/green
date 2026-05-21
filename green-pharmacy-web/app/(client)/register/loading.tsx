import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

export default function RegisterLoading() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="bg-muted h-8 w-48 animate-pulse rounded-md" />
          <div className="bg-muted mt-2 h-4 w-full animate-pulse rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-24 w-full animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
