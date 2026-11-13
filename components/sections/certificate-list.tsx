import { AwardIcon } from "lucide-react"

import { Reveal } from "@/components/shared/motion/reveal"
import { Section } from "@/components/shared/section"
import type { TimelineItem } from "@/lib/content"

// 홈의 자격증 목록. timeline.json에서 type이 certificate인 항목만 받아 경력·학력과 따로 보여 줍니다.
export function CertificateList({ items }: { items: readonly TimelineItem[] }) {
  if (items.length === 0) return null

  return (
    <Section title="자격증" className="border-b">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Reveal as="li" key={`${item.period}-${item.title}`} delay={index * 0.05}>
            <div className="flex h-full items-start gap-3 border bg-card px-4 py-3">
              <span aria-hidden className="flex size-7 shrink-0 items-center justify-center border text-primary">
                <AwardIcon className="size-3.5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <h3 className="font-heading text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {item.organization} · <span className="font-mono">{item.period}</span>
                </p>
                {item.description && <p className="mt-1 text-sm">{item.description}</p>}
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
