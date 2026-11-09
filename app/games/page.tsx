import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { GameYearList } from "@/components/sections/game-year-list"
import { PageHeader } from "@/components/shared/page-header"
import { getGameYears, getGamesByYear } from "@/lib/games"

export const metadata: Metadata = {
  title: "게임",
  description: "해마다 플레이한 게임 기록",
}

export default function GamesPage() {
  const years = getGameYears().map((year) => ({ year, games: getGamesByYear(year) ?? [] }))

  return (
    <Container className="flex flex-col gap-8 py-12">
      <PageHeader title="게임" description="해마다 플레이한 게임 기록" />
      <GameYearList years={years} />
    </Container>
  )
}
