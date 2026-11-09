import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { countGroups, type Game } from "@/lib/games"

type YearEntry = { year: number; games: readonly Game[] }

// 연도 카드 목록 (최신 연도가 앞). 카드 전체가 그 연도 페이지로 가는 링크입니다.
export function GameYearList({ years }: { years: YearEntry[] }) {
  if (years.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">아직 기록한 게임이 없습니다</p>
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {years.map(({ year, games }) => (
        <li key={year}>
          <Link href={`/games/${year}`} className="group block h-full border border-transparent accent-hover">
            <Card className="h-full gap-4 px-(--card-spacing)">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-3xl font-bold tracking-tight">{year}</h2>
                <ArrowRightIcon
                  aria-hidden
                  className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
                />
              </div>
              <p className="text-sm text-muted-foreground">플레이 게임 {games.length}개</p>
              <p className="font-mono text-xs text-muted-foreground">
                {countGroups(games)
                  .map(({ label, count }) => `${label} ${count}`)
                  .join(" · ")}
              </p>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  )
}
