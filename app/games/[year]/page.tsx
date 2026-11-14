import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/container"
import { GameYearView } from "@/components/sections/game-year-view"
import { getGameYears, getGamesByYear } from "@/lib/games"
import { pageMetadata } from "@/lib/metadata"

// 빌드 시 기록이 있는 연도마다 정적 페이지를 만들고, 그 밖의 연도는 404(GAME OVER)
export function generateStaticParams() {
  return getGameYears().map((year) => ({ year: String(year) }))
}

export const dynamicParams = false

// 주소의 연도("2026")를 숫자로. 네 자리 숫자가 아니면 null
function parseYear(value: string): number | null {
  return /^\d{4}$/.test(value) ? Number(value) : null
}

export async function generateMetadata({ params }: PageProps<"/games/[year]">): Promise<Metadata> {
  const year = parseYear((await params).year)
  if (year === null || !getGamesByYear(year)) return {}
  return pageMetadata({
    title: `${year} 플레이 게임`,
    description: `${year}년에 플레이한 게임 기록`,
    path: `/games/${year}`,
  })
}

export default async function GameYearPage({ params }: PageProps<"/games/[year]">) {
  const year = parseYear((await params).year)
  const games = year === null ? null : getGamesByYear(year)
  if (year === null || !games) notFound()

  return (
    <Container className="flex flex-col gap-8 py-12">
      <GameYearView
        title={`${year} 플레이 게임`}
        description={`${year}년에 플레이한 게임 기록`}
        current={year}
        years={getGameYears()}
        games={games}
      />
    </Container>
  )
}
