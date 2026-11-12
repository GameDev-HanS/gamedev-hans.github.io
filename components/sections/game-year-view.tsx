import { GameCoverCredit } from "@/components/sections/game-cover-credit"
import { GameList } from "@/components/sections/game-list"
import { PageHeader } from "@/components/shared/page-header"
import { YearTabs } from "@/components/shared/year-tabs"
import type { Game } from "@/lib/games"

// 플레이 게임 화면: 제목 + 보기 목록(전체·연도) + 상태별 게임 목록 + 표지 출처.
// /games(전체)와 /games/<연도>가 함께 씁니다.
export function GameYearView({
  title,
  description,
  current,
  years,
  games,
}: {
  title: string
  description: string
  current: number | "all"
  years: number[]
  games: readonly Game[]
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <YearTabs years={years} current={current} />
      <GameList games={games} />
      <GameCoverCredit games={games} />
    </>
  )
}
