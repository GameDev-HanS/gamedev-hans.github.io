import { Stagger, StaggerItem } from "@/components/shared/motion/stagger"
import { Section } from "@/components/shared/section"
import { TechBadge } from "@/components/shared/tech-badge"
import { SKILL_CATEGORIES, type Skill } from "@/lib/content"
import { UI, type Locale } from "@/lib/i18n"

// 홈의 기술 스택 (T-204). 분류마다 제목 + 배지 줄, 기술이 없는 분류는 숨깁니다.
// 분류 안 순서는 skills.json에 적은 순서입니다. 분류 이름은 lib/i18n.ts의 skillCategory (기술 이름은 원래 영어)
export function SkillStack({ skills, locale = "ko" }: { skills: readonly Skill[]; locale?: Locale }) {
  const t = UI[locale]
  const groups = SKILL_CATEGORIES.map((category) => ({
    category,
    items: skills.filter((skill) => skill.category === category),
  })).filter((group) => group.items.length > 0)

  if (groups.length === 0) return null

  return (
    <Section title={t.skillStack} className="border-b">
      <dl className="flex flex-col gap-5">
        {groups.map((group, index) => (
          // dl 안에서는 dt·dd를 div 한 겹으로만 묶을 수 있어, Stagger(div, 움직이지 않음)가 묶음이자
          // 스크롤 감시를 맡고 dt·dd가 함께(gap 0) 움직입니다 (T-128)
          <Stagger
            key={group.category}
            inView
            delay={index * 0.05}
            gap={0}
            className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
          >
            <StaggerItem as="dt" className="shrink-0 pt-1.5 text-xs font-medium text-muted-foreground sm:w-24">
              {t.skillCategory[group.category]}
            </StaggerItem>
            <StaggerItem as="dd">
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((skill) => (
                  <li key={skill.name}>
                    <TechBadge name={skill.name} icon={skill.icon} />
                  </li>
                ))}
              </ul>
            </StaggerItem>
          </Stagger>
        ))}
      </dl>
    </Section>
  )
}
