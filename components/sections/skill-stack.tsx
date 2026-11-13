import { Reveal } from "@/components/shared/motion/reveal"
import { Section } from "@/components/shared/section"
import { TechBadge } from "@/components/shared/tech-badge"
import { SKILL_CATEGORIES, type Skill, type SkillCategory } from "@/lib/content"

const CATEGORY_LABEL: Record<SkillCategory, string> = {
  language: "언어",
  engine: "게임 엔진",
  os: "운영체제",
  ide: "IDE",
  etc: "기타",
}

// 홈의 기술 스택 (T-204). 분류마다 제목 + 배지 줄, 기술이 없는 분류는 숨깁니다.
// 분류 안 순서는 skills.json에 적은 순서입니다.
export function SkillStack({ skills }: { skills: readonly Skill[] }) {
  const groups = SKILL_CATEGORIES.map((category) => ({
    category,
    items: skills.filter((skill) => skill.category === category),
  })).filter((group) => group.items.length > 0)

  if (groups.length === 0) return null

  return (
    <Section title="기술 스택" className="border-b">
      <dl className="flex flex-col gap-5">
        {groups.map((group, index) => (
          // dl 안에서는 dt·dd를 div 하나로만 묶을 수 있어 Reveal(div)이 그 묶음 역할을 합니다
          <Reveal
            key={group.category}
            delay={index * 0.05}
            className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
          >
            <dt className="shrink-0 pt-1.5 text-xs font-medium text-muted-foreground sm:w-24">
              {CATEGORY_LABEL[group.category]}
            </dt>
            <dd>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((skill) => (
                  <li key={skill.name}>
                    <TechBadge name={skill.name} icon={skill.icon} />
                  </li>
                ))}
              </ul>
            </dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  )
}
