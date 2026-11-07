import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <Container className="flex flex-col gap-4 py-12">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </Container>
  )
}
