// 게임 상태 값과 한글 이름. 파일을 읽지 않으므로 클라이언트 컴포넌트에서도 import할 수 있습니다.
// (lib/games.ts는 server-only라 클라이언트에서 import하면 빌드 오류)

export const GAME_STATUSES = ["playing", "cleared", "dropped", "wishlist"] as const

export type GameStatus = (typeof GAME_STATUSES)[number]

/** 상태 배지·묶음 제목에 쓰는 한글 이름 */
export const STATUS_LABEL: Record<GameStatus, string> = {
  playing: "플레이 중",
  cleared: "클리어",
  dropped: "중단",
  wishlist: "하고 싶은 게임",
}
