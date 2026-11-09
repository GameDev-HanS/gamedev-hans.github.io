import { GameCard } from "@/components/shared/game-card"
import { countGroups, groupGames, type Game } from "@/lib/games"

// 한 해의 게임을 상태별로 묶어 보여 줍니다. 맨 위에 묶음별 개수 요약.
export function GameList({ games }: { games: readonly Game[] }) {
  if (games.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">아직 기록한 게임이 없습니다</p>
  }

  const groups = groupGames(games)
  const summary = countGroups(games)

  return (
    <div className="flex flex-col gap-12">
      <p className="font-mono text-xs text-muted-foreground">
        {summary.map(({ label, count }) => `${label} ${count}`).join(" · ")}
      </p>
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`group-${group.key}`} className="flex flex-col gap-4">
          <h2 id={`group-${group.key}`} className="flex items-baseline gap-2 font-heading text-lg font-semibold">
            {group.label}
            <span className="font-mono text-xs font-normal text-muted-foreground">{group.games.length}</span>
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
