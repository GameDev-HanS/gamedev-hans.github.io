import Image from "next/image"
import { PlayIcon } from "lucide-react"

import { GameTrailerDialog } from "@/components/shared/game-trailer-dialog"
import { StarRating } from "@/components/shared/star-rating"
import { Badge } from "@/components/ui/badge"
import { STATUS_LABEL } from "@/lib/game-status"
import type { Game } from "@/lib/games"
import { cn } from "@/lib/utils"

// 플레이한 게임 한 줄(바 형태). 왼쪽 작은 이니셜(또는 표지) 칸, 가운데 제목·정보, 오른쪽 PV 표시.
// 값이 없는 항목(상태·평점·소감·시간·날짜)은 숨깁니다. PV(trailer)가 있으면 줄 전체를 덮는 버튼으로 팝업을 엽니다.
export function GameCard({ game }: { game: Game }) {
  // "시작 ~ 끝", 끝낸 날이 없으면 "시작 ~", 시작일이 없으면 "~ 끝"
  const dates =
    game.startedAt || game.endedAt ? `${game.startedAt ?? ""} ~ ${game.endedAt ?? ""}`.trim() : null
  const meta = [game.playtime !== undefined ? `${game.playtime}시간` : null, dates].filter(Boolean).join(" · ")

  return (
    <div
      className={cn(
        "group relative flex h-full items-center gap-3 border bg-card px-3 py-2.5",
        game.trailer && "accent-hover"
      )}
    >
      {/* 작은 이니셜(표지가 있으면 표지) 칸 (장식용) */}
      <div aria-hidden className="relative size-10 shrink-0 overflow-hidden bg-linear-to-br from-primary/20 to-card">
        {game.cover ? (
          <Image src={game.cover} alt="" fill sizes="40px" className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center font-heading text-lg font-bold text-primary/80">
            {Array.from(game.title)[0]}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* 제목 줄은 한 줄 유지: 긴 제목은 …로 줄이고(마우스를 올리면 전체 제목), 배지·별점은 줄어들지 않음 */}
        <div className="flex min-w-0 items-center gap-2">
          <h3
            title={game.trailer ? undefined : game.title}
            className="min-w-0 truncate font-heading text-sm font-semibold"
          >
            {game.title}
          </h3>
          {game.status && (
            <Badge variant={game.status === "playing" ? "default" : "secondary"} className="shrink-0">
              {STATUS_LABEL[game.status]}
            </Badge>
          )}
          {game.rating && <StarRating value={game.rating} className="shrink-0" />}
        </div>
        {game.comment && <p className="line-clamp-1 text-xs text-muted-foreground">{game.comment}</p>}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
          {meta && <span>{meta}</span>}
          <ul className="flex flex-wrap gap-1" aria-label="플랫폼">
            {game.platforms.map((platform) => (
              <li key={platform}>
                <Badge variant="outline">{platform}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {game.trailer && (
        // PV가 있다는 표시 (장식, 버튼 이름에 "PV 보기"가 있음)
        <span
          aria-hidden
          className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-primary"
        >
          <PlayIcon className="size-3.5 fill-current" />
          PV
        </span>
      )}
      {game.trailer && <GameTrailerDialog videoId={game.trailer} title={game.title} />}
    </div>
  )
}
