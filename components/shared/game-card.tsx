import Image from "next/image"

import { StarRating } from "@/components/shared/star-rating"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { STATUS_LABEL } from "@/lib/game-status"
import type { Game } from "@/lib/games"

// 플레이한 게임 카드. 값이 없는 항목(상태·평점·소감·시간·날짜)은 줄째 숨깁니다.
export function GameCard({ game }: { game: Game }) {
  // "시작 ~ 끝", 끝낸 날이 없으면 "시작 ~", 시작일이 없으면 "~ 끝"
  const dates =
    game.startedAt || game.endedAt ? `${game.startedAt ?? ""} ~ ${game.endedAt ?? ""}`.trim() : null

  return (
    <Card className="h-full gap-3 pt-0">
      {/* 세로형(3:4) 표지 자리. 표지가 없으면 제목 첫 글자를 크게 보여 줍니다 (장식용) */}
      <div className="relative aspect-3/4 overflow-hidden">
        {game.cover ? (
          <Image
            src={game.cover}
            alt=""
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-full items-center justify-center bg-linear-to-br from-primary/15 via-card to-card"
          >
            <span className="font-heading text-5xl font-bold text-primary/70">
              {Array.from(game.title)[0]}
            </span>
          </div>
        )}
        {game.status && (
          <Badge
            variant={game.status === "playing" ? "default" : "secondary"}
            className="absolute top-2 left-2"
          >
            {STATUS_LABEL[game.status]}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-(--card-spacing)">
        <h3 className="font-heading text-sm font-semibold leading-snug">{game.title}</h3>
        {game.rating && <StarRating value={game.rating} />}
        {game.comment && <p className="line-clamp-2 text-xs text-muted-foreground">{game.comment}</p>}
        <div className="mt-auto flex flex-col gap-1.5 pt-1 font-mono text-[11px] text-muted-foreground">
          {game.playtime !== undefined && <span>{game.playtime}시간</span>}
          {dates && <span>{dates}</span>}
          <ul className="flex flex-wrap gap-1" aria-label="플랫폼">
            {game.platforms.map((platform) => (
              <li key={platform}>
                <Badge variant="outline">{platform}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
