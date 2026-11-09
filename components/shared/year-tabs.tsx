import Link from "next/link"

import { cn } from "@/lib/utils"

// 연도 전환 탭: 기록이 있는 연도만, 최신 연도가 앞. 현재 연도는 포인트 색 밑줄.
export function YearTabs({ years, current }: { years: number[]; current: number }) {
  return (
    <nav aria-label="연도 선택">
      <ul className="flex flex-wrap gap-1 border-b">
        {years.map((year) => {
          const active = year === current
          return (
            <li key={year}>
              <Link
                href={`/games/${year}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-block border-b-2 px-3 py-2 font-mono text-sm transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {year}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
