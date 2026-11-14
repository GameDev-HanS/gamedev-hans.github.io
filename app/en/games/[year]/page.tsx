import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/container"
import { GameYearView } from "@/components/sections/game-year-view"
import { getGameYears, getGamesByYear, parseYear } from "@/lib/games"
import { UI } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"

const t = UI.en.games

// 영어 연도별 게임 페이지 (v1.1.2). 한국어 /games/<연도>와 같은 연도마다 만듭니다.
export function generateStaticParams() {
  return getGameYears().map((year) => ({ year: String(year) }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/en/games/[year]">): Promise<Metadata> {
  const year = parseYear((await params).year)
  if (year === null || !getGamesByYear(year)) return {}
  return pageMetadata({
    title: t.yearTitle(year),
    description: t.yearDescription(year),
    path: `/en/games/${year}`,
    locale: "en",
    languages: { ko: `/games/${year}`, en: `/en/games/${year}` },
  })
}

export default async function EnglishGameYearPage({ params }: PageProps<"/en/games/[year]">) {
  const year = parseYear((await params).year)
  const games = year === null ? null : getGamesByYear(year)
  if (year === null || !games) notFound()

  return (
    <Container className="flex flex-col gap-8 py-12">
      <GameYearView
        title={t.yearTitle(year)}
        description={t.yearDescription(year)}
        current={year}
        years={getGameYears()}
        games={games}
        locale="en"
      />
    </Container>
  )
}
