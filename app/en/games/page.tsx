import { Container } from "@/components/layout/container"
import { GameYearView } from "@/components/sections/game-year-view"
import { getAllGames, getGameYears } from "@/lib/games"
import { UI } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"

const t = UI.en.games

export const metadata = pageMetadata({
  title: t.metaTitle,
  description: t.description,
  path: "/en/games",
  locale: "en",
  languages: { ko: "/games", en: "/en/games" },
})

// 영어 게임 전체 보기 (v1.1.2). 한국어 /games와 같은 데이터를 영어 문구·영문 이름(titleEn)으로 보여 줍니다.
export default function EnglishGamesPage() {
  return (
    <Container className="flex flex-col gap-8 py-12">
      <GameYearView
        title={t.title}
        description={t.description}
        current="all"
        years={getGameYears()}
        games={getAllGames()}
        locale="en"
      />
    </Container>
  )
}
