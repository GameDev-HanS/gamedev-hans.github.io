import { PlayIcon } from "lucide-react"

import { GameCard } from "@/components/shared/game-card"
import { Reveal } from "@/components/shared/motion/reveal"
import { countGroups, groupGames, type Game } from "@/lib/games"
import { UI, type Locale } from "@/lib/i18n"
import { STAGGER } from "@/lib/motion"

// 데스크톱 한 줄에 놓이는 게임 줄 수 (아래 lg:grid-cols-2와 맞춤)
const COLUMNS = 2

// 게임을 상태별로 묶어 한 줄(바) 목록으로 보여 줍니다. 맨 위에 묶음별 개수 요약과 PV 안내.
// 요약·묶음 제목·게임 줄은 스크롤해서 화면에 들어올 때마다 나타나고(글 목록과 같은 방식),
// 같은 줄의 게임은 왼쪽부터 조금씩 늦게 나타납니다.
// games는 화면 언어에 맞춘 목록(localizeGames)을 받습니다.
export function GameList({ games, locale = "ko" }: { games: readonly Game[]; locale?: Locale }) {
  const t = UI[locale].games
  if (games.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">{t.empty}</p>
  }

  const groups = groupGames(games, locale)
  const summary = countGroups(games, locale)
  const hasTrailer = games.some((game) => game.trailer)

  return (
    <div className="flex flex-col gap-10">
      <Reveal className="flex flex-col gap-1.5">
        <p className="font-mono text-xs text-muted-foreground">
          {summary.map(({ label, count }) => `${label} ${count}`).join(" · ")}
        </p>
        {hasTrailer && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <PlayIcon aria-hidden className="mt-0.5 size-3 shrink-0 fill-current text-primary" />
            {t.trailerNotice}
          </p>
        )}
      </Reveal>
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`group-${group.key}`} className="flex flex-col gap-3">
          <Reveal>
            <h2 id={`group-${group.key}`} className="flex items-baseline gap-2 font-heading text-base font-semibold">
              {group.label}
              <span className="font-mono text-xs font-normal text-muted-foreground">{group.games.length}</span>
            </h2>
          </Reveal>
          {/* grid-cols-1: 칸 폭을 화면에 맞춤 (지정하지 않으면 긴 제목만큼 칸이 늘어나 모바일에서 가로로 넘침) */}
          <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {group.games.map((game, index) => (
              <Reveal as="li" key={game.slug} delay={(index % COLUMNS) * STAGGER}>
                <GameCard game={game} locale={locale} />
              </Reveal>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
