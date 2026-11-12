import { PlayIcon } from "lucide-react"

import { GameCard } from "@/components/shared/game-card"
import { countGroups, groupGames, type Game } from "@/lib/games"

// 게임을 상태별로 묶어 한 줄(바) 목록으로 보여 줍니다. 맨 위에 묶음별 개수 요약과 PV 안내.
export function GameList({ games }: { games: readonly Game[] }) {
  if (games.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">아직 기록한 게임이 없습니다</p>
  }

  const groups = groupGames(games)
  const summary = countGroups(games)
  const hasTrailer = games.some((game) => game.trailer)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1.5">
        <p className="font-mono text-xs text-muted-foreground">
          {summary.map(({ label, count }) => `${label} ${count}`).join(" · ")}
        </p>
        {hasTrailer && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <PlayIcon aria-hidden className="mt-0.5 size-3 shrink-0 fill-current text-primary" />
            PV 표시가 있는 게임을 누르면 공식 PV(YouTube)가 팝업으로 재생됩니다. 누르기 전에는 YouTube에 연결하지 않습니다.
          </p>
        )}
      </div>
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`group-${group.key}`} className="flex flex-col gap-3">
          <h2 id={`group-${group.key}`} className="flex items-baseline gap-2 font-heading text-base font-semibold">
            {group.label}
            <span className="font-mono text-xs font-normal text-muted-foreground">{group.games.length}</span>
          </h2>
          {/* grid-cols-1: 칸 폭을 화면에 맞춤 (지정하지 않으면 긴 제목만큼 칸이 늘어나 모바일에서 가로로 넘침) */}
          <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {group.games.map((game) => (
              <li key={game.slug}>
                <GameCard game={game} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
