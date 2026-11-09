import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/layout/container"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "GAME OVER",
}

// 없는 주소 전체를 처리하는 404 페이지 (빌드 시 out/404.html로 생성)
export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="font-mono text-xs tracking-[0.4em] text-primary">404 · STAGE NOT FOUND</p>
      <h1 className="font-heading text-5xl font-bold tracking-widest sm:text-7xl">
        GAME OVER
      </h1>
      <div className="flex flex-col gap-1">
        <p className="text-sm">페이지를 찾을 수 없습니다.</p>
        <p className="text-sm text-muted-foreground">
          주소가 바뀌었거나 삭제된 페이지입니다. CONTINUE?
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          홈으로
        </Link>
        <Link
          href="/blog"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "accent-hover")}
        >
          블로그 보기
        </Link>
      </div>
    </Container>
  )
}
