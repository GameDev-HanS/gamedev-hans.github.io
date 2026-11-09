import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

// 홈 상단 영역. 소개 데이터(T-201~)가 생기면 이름·소개 문구를 그쪽에서 가져옵니다.
export function Hero() {
  return (
    <section className="border-b py-20 sm:py-28">
      <Container className="flex flex-col items-start gap-6">
        <Badge variant="secondary" className="font-mono">
          Game Dev Log
        </Badge>
        <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-6xl">
          {siteConfig.name}
          <span aria-hidden className="text-primary">
            .
          </span>
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {siteConfig.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/blog" className={buttonVariants({ size: "lg" })}>
            전체 글 보기
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          <Link
            href="/about"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "accent-hover")}
          >
            소개
          </Link>
        </div>
      </Container>
    </section>
  )
}
