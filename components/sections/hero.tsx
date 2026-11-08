import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

// 홈 상단 영역. 본격 디자인은 로드맵의 홈 작업에서 바꿉니다.
export function Hero() {
  return (
    <section className="border-b py-20 sm:py-28">
      <Container className="flex flex-col items-start gap-6">
        <Badge variant="secondary">Game Dev Log</Badge>
        <h1 className="max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {siteConfig.description}
        </p>
        <Link href="/about" className={buttonVariants({ size: "lg" })}>
          소개 보기
          <ArrowRightIcon data-icon="inline-end" />
        </Link>
      </Container>
    </section>
  )
}
