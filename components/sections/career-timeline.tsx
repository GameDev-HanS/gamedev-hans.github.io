import { AwardIcon, BriefcaseIcon, GraduationCapIcon, type LucideIcon } from "lucide-react"

import { Reveal } from "@/components/shared/motion/reveal"
import { Section } from "@/components/shared/section"
import type { TimelineItem } from "@/lib/content"
import { UI, type Locale } from "@/lib/i18n"

// 종류별 아이콘 (라벨 글자는 lib/i18n.ts의 timelineType)
const TYPE_ICON: Record<TimelineItem["type"], LucideIcon> = {
  work: BriefcaseIcon,
  education: GraduationCapIcon,
  certificate: AwardIcon,
}

// 홈의 경력·학력 세로 타임라인 (T-206). timeline.json에 적은 순서 그대로 보여 줍니다.
// 왼쪽 세로 선 위의 아이콘과 라벨로 경력·교육을 구분합니다. 자격증은 홈에서 CertificateList로 따로 보여 주지만,
// 혹시 넘어와도 깨지지 않게 라벨·아이콘은 남겨 둡니다.
export function CareerTimeline({ items, locale = "ko" }: { items: readonly TimelineItem[]; locale?: Locale }) {
  if (items.length === 0) return null
  const t = UI[locale]

  return (
    <Section title={t.careerTitle} className="border-b">
      <ol className="relative flex flex-col gap-8 border-l border-border pl-8 sm:ml-2">
        {items.map((item) => {
          const Icon = TYPE_ICON[item.type]
          const label = t.timelineType[item.type]
          return (
            <Reveal as="li" key={`${item.period}-${item.title}`} className="relative">
              {/* 세로 선 위의 아이콘 칸 (장식용 — 라벨 글자가 함께 있음) */}
              <span
                aria-hidden
                className="absolute top-0 -left-[calc(2rem+0.875rem+0.5px)] flex size-7 items-center justify-center border bg-background text-primary"
              >
                <Icon className="size-3.5" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-xs text-muted-foreground">
                  <span>{item.period}</span>
                  <span aria-hidden>·</span>
                  <span>{label}</span>
                </p>
                <h3 className="font-heading text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.organization}</p>
                {item.description && <p className="mt-1 text-sm">{item.description}</p>}
              </div>
            </Reveal>
          )
        })}
      </ol>
    </Section>
  )
}
