import Link from "next/link"

import { UI, localePath, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// 보기 목록: '전체'(/games) + 기록이 있는 연도(최신순, /games/<연도>). 현재 보기는 포인트 색 밑줄.
// 영어판(v1.1.2)은 All과 /en/games 아래 주소로 연결합니다.
export function YearTabs({
  years,
  current,
  locale = "ko",
}: {
  years: number[]
  current: number | "all"
  locale?: Locale
}) {
  const t = UI[locale].games
  const items = [
    { key: "all" as const, label: t.all, href: localePath(locale, "/games") },
    ...years
      .toSorted((a, b) => b - a)
      .map((year) => ({ key: year, label: String(year), href: localePath(locale, `/games/${year}`) })),
  ]

  return (
    <nav aria-label={t.viewNav}>
      <ul className="flex flex-wrap gap-1 border-b">
        {items.map((item) => {
          const active = item.key === current
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-block border-b-2 px-3 py-2 font-mono text-sm transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground focus-visible:text-foreground"
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
