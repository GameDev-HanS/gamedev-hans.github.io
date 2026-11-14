import { GameCoverCredit } from "@/components/sections/game-cover-credit"
import { GameList } from "@/components/sections/game-list"
import { PageHeader } from "@/components/shared/page-header"
import { YearTabs } from "@/components/shared/year-tabs"
import { localizeGames, type Game } from "@/lib/games"
import type { Locale } from "@/lib/i18n"

// 플레이 게임 화면: 제목 + 보기 목록(전체·연도) + 상태별 게임 목록 + 표지 출처.
// /games(전체)와 /games/<연도>, 영어판 /en/games·/en/games/<연도>(v1.1.2)가 함께 씁니다.
// 게임 제목·소감·플랫폼은 여기서 화면 언어에 맞춰 바꿔 아래 컴포넌트에 넘깁니다.
export function GameYearView({
  title,
  description,
  current,
  years,
  games,
  locale = "ko",
}: {
  title: string
  description: string
  current: number | "all"
  years: number[]
  games: readonly Game[]
  locale?: Locale
}) {
  const localized = localizeGames(games, locale)
  return (
    <>
      <PageHeader title={title} description={description} />
      <YearTabs years={years} current={current} locale={locale} />
      <GameList games={localized} locale={locale} />
      <GameCoverCredit games={localized} locale={locale} />
    </>
  )
}
