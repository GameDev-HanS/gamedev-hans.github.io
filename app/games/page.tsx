import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { GameYearView } from "@/components/sections/game-year-view"
import { getAllGames, getGameYears } from "@/lib/games"

export const metadata: Metadata = {
  title: "게임",
  description: "지금까지 플레이한 게임 기록",
}

// 헤더 '게임'으로 들어오면 전체 보기(모든 연도 + 2026 이전 게임). 연도별 보기는 보기 목록에서 선택.
// 연도 파일은 최소 1개 있어야 합니다 (없으면 /games/[year]의 generateStaticParams 때문에 빌드 실패).
export default function GamesPage() {
  return (
    <Container className="flex flex-col gap-8 py-12">
      <GameYearView
        title="플레이 게임"
        description="지금까지 플레이한 게임 기록"
        current="all"
        years={getGameYears()}
        games={getAllGames()}
      />
    </Container>
  )
}
