import type { Game } from "@/lib/games"

// 표지 이미지 출처. 표지가 있는 게임이 하나도 없으면 아무것도 보여 주지 않습니다.
export function GameCoverCredit({ games }: { games: readonly Game[] }) {
  const withCover = games.filter((game) => game.cover && game.coverCredit)
  if (withCover.length === 0) return null

  return (
    <footer className="flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground">
      <p>표지 이미지 저작권은 각 게임사에 있습니다.</p>
      <ul className="flex flex-col gap-1">
        {withCover.map((game) => (
          <li key={game.slug}>
            {game.title} — {game.coverCredit}
          </li>
        ))}
      </ul>
    </footer>
  )
}
