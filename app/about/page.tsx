import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/shared/page-header"
import { Section } from "@/components/shared/section"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "소개",
  description: "스타터킷의 폴더 구조와 컴포넌트 계층",
}

const layers = [
  { path: "components/ui", desc: "shadcn 원자 컴포넌트 (CLI로 추가)" },
  { path: "components/providers", desc: "앱 전역 Provider (테마 등)" },
  { path: "components/layout", desc: "헤더, 푸터, 내비게이션, 컨테이너" },
  { path: "components/shared", desc: "여러 페이지에서 재사용하는 블록" },
  { path: "components/sections", desc: "페이지를 구성하는 큰 섹션" },
  { path: "config/site.ts", desc: "사이트 이름, URL, 메뉴" },
]

const libraries = [
  ["next-themes", "다크 모드"],
  ["react-hook-form + zod", "폼 상태와 검증"],
  ["sonner", "토스트 알림"],
  ["lucide-react", "아이콘"],
  ["class-variance-authority", "컴포넌트 변형"],
]

export default function AboutPage() {
  return (
    <>
      <Container className="pt-12">
        <PageHeader
          title="소개"
          description="일반 콘텐츠 페이지 템플릿입니다. 스타터킷의 구조를 설명합니다."
        />
      </Container>

      <Section
        title="컴포넌트 계층"
        description="아래 층은 위 층을 가져오지 않습니다. (ui → layout/shared → sections → app)"
      >
        <ul className="flex flex-col">
          {layers.map((layer, i) => (
            <li key={layer.path}>
              {i > 0 && <Separator />}
              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
                <code className="w-56 shrink-0 font-mono text-sm">{layer.path}</code>
                <span className="text-sm text-muted-foreground">{layer.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="사용 라이브러리"
        description="유틸리티는 직접 만들지 않고 검증된 라이브러리를 사용합니다."
        className="pt-0"
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {libraries.map(([name, use]) => (
            <li key={name} className="flex justify-between border p-3 text-sm">
              <span className="font-mono">{name}</span>
              <span className="text-muted-foreground">{use}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
