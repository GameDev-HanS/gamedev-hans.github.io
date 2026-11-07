"use client"

import { useEffect } from "react"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-lg font-semibold">문제가 발생했습니다</h1>
      <p className="text-sm text-muted-foreground">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button onClick={() => reset()}>다시 시도</Button>
    </Container>
  )
}
