import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

export function Hero() {
  return (
    <section className="border-b py-20 sm:py-28">
      <Container className="flex flex-col items-start gap-6">
        <Badge variant="secondary">Next.js 16 · App Router</Badge>
        <h1 className="max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-5xl">
          빠르게 시작하는 모던 웹 스타터킷
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {siteConfig.description}. 레이아웃, 다크 모드, 공통 컴포넌트, 폼 검증,
          GitHub Pages 배포까지 미리 갖춰져 있습니다.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/components" className={buttonVariants({ size: "lg" })}>
            컴포넌트 보기
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          <Link
            href="/about"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            구조 알아보기
          </Link>
        </div>
      </Container>
    </section>
  )
}
