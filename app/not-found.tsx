import Link from "next/link"

import { Container } from "@/components/layout/container"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-heading text-5xl font-bold">404</p>
      <h1 className="text-lg font-semibold">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-muted-foreground">
        주소가 바뀌었거나 삭제된 페이지입니다.
      </p>
      <Link href="/" className={buttonVariants()}>
        홈으로 돌아가기
      </Link>
    </Container>
  )
}
