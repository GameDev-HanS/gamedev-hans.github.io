// 게임 상태 값. 파일을 읽지 않으므로 클라이언트 컴포넌트에서도 import할 수 있습니다.
// (lib/games.ts는 server-only라 클라이언트에서 import하면 빌드 오류)
// 상태 이름(배지·묶음 제목)은 언어별로 lib/i18n.ts의 UI[locale].games.status에 있습니다 (v1.1.2).

export const GAME_STATUSES = ["playing", "cleared", "dropped", "wishlist"] as const

export type GameStatus = (typeof GAME_STATUSES)[number]
