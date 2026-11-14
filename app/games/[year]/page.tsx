import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/container"
import { GameYearView } from "@/components/sections/game-year-view"
import { getGameYears, getGamesByYear, parseYear } from "@/lib/games"
import { UI } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"

// 빌드 시 기록이 있는 연도마다 정적 페이지를 만들고, 그 밖의 연도는 404(GAME OVER)
export function generateStaticParams() {
  return getGameYears().map((year) => ({ year: String(year) }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/games/[year]">): Promise<Metadata> {
  const year = parseYear((await params).year)
  if (year === null || !getGamesByYear(year)) return {}
  return pageMetadata({
    title: UI.ko.games.yearTitle(year),
    description: UI.ko.games.yearDescription(year),
    path: `/games/${year}`,
    languages: { ko: `/games/${year}`, en: `/en/games/${year}` },
  })
}

export default async function GameYearPage({ params }: PageProps<"/games/[year]">) {
  const year = parseYear((await params).year)
  const games = year === null ? null : getGamesByYear(year)
  if (year === null || !games) notFound()

  return (
    <Container className="flex flex-col gap-8 py-12">
      <GameYearView
        title={UI.ko.games.yearTitle(year)}
        description={UI.ko.games.yearDescription(year)}
        current={year}
        years={getGameYears()}
        games={games}
      />
    </Container>
  )
}
