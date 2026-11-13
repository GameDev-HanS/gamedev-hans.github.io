import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { Stagger, StaggerItem } from "@/components/shared/motion/stagger"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

// 홈 상단 영역. 배지 → 사이트 이름 → 설명 → 버튼이 차례로 나타납니다.
// 운영자 소개(프로필·기술 스택·경력)는 바로 아래 섹션들이 맡습니다 (2026-11-13 /about을 홈으로 합침).
export function Hero() {
  return (
    <section className="border-b py-20 sm:py-28">
      <Container>
        {/* 헤더 차례 등장(약 0.6초)과 겹쳐 이어지도록 조금 늦게 시작 */}
        <Stagger delay={0.25} className="flex flex-col items-start gap-6">
          <StaggerItem>
            <Badge variant="secondary" className="font-mono">
              Game Dev Log
            </Badge>
          </StaggerItem>
          <StaggerItem>
            <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-6xl">
              {siteConfig.name}
              <span aria-hidden className="text-primary">
                .
              </span>
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {siteConfig.description}
            </p>
          </StaggerItem>
          <StaggerItem className="flex flex-wrap gap-3">
            <Link href="/blog" className={buttonVariants({ size: "lg" })}>
              전체 글 보기
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  )
}
