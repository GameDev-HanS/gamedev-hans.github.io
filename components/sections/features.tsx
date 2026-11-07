import {
  BlocksIcon,
  FileCodeIcon,
  MoonStarIcon,
  PaletteIcon,
  RocketIcon,
  ShieldCheckIcon,
  type LucideIcon,
} from "lucide-react"

import { Section } from "@/components/shared/section"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: RocketIcon,
    title: "Next.js App Router",
    description: "서버 컴포넌트 기반 라우팅과 레이아웃, 메타데이터 파일 규칙 적용",
  },
  {
    icon: FileCodeIcon,
    title: "TypeScript",
    description: "strict 모드와 경로 별칭(@/*)으로 안전한 개발",
  },
  {
    icon: PaletteIcon,
    title: "TailwindCSS v4",
    description: "CSS 변수 기반 테마 토큰으로 일관된 디자인",
  },
  {
    icon: BlocksIcon,
    title: "shadcn/ui",
    description: "Base UI 기반 접근성 컴포넌트를 코드로 소유",
  },
  {
    icon: MoonStarIcon,
    title: "다크 모드",
    description: "next-themes로 라이트/다크/시스템 테마 전환",
  },
  {
    icon: ShieldCheckIcon,
    title: "폼 검증",
    description: "react-hook-form과 zod로 타입 안전한 폼 처리",
  },
]

export function Features() {
  return (
    <Section
      title="기술 스택"
      description="검증된 라이브러리로 구성해 바로 기능 개발에 집중할 수 있습니다."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="mb-2 size-6 text-primary" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Section>
  )
}
