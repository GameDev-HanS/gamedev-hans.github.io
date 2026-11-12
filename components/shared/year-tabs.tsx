import Link from "next/link"

import { cn } from "@/lib/utils"

// 보기 목록: '전체'(/games) + 기록이 있는 연도(최신순, /games/<연도>). 현재 보기는 포인트 색 밑줄.
export function YearTabs({ years, current }: { years: number[]; current: number | "all" }) {
  const items = [
    { key: "all" as const, label: "전체", href: "/games" },
    ...years.toSorted((a, b) => b - a).map((year) => ({ key: year, label: String(year), href: `/games/${year}` })),
  ]

  return (
    <nav aria-label="보기 선택">
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
                    : "border-transparent text-muted-foreground hover:text-foreground"
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
