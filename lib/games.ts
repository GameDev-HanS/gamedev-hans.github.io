// 클라이언트 컴포넌트에서 import하면 빌드 단계에서 오류가 나도록 막습니다 (fs 사용)
import "server-only"

import fs from "node:fs"
import path from "node:path"

import { cache } from "react"
import { z } from "zod"

import { SLUG, SLUG_MESSAGE, dateString, formatIssues, required } from "./schema"

// 플레이 게임 기록 로더. content/games/<연도>.json(게임 배열)을 읽고 검증합니다.
// 형식이 틀리면 파일 이름이 들어간 메시지로 빌드를 실패시켜 잘못된 기록이 배포되지 않게 합니다.
const GAMES_DIR = path.join(process.cwd(), "content", "games")
const PUBLIC_DIR = path.join(process.cwd(), "public")

const YEAR_FILE = /^(\d{4})\.json$/

export const GAME_STATUSES = ["playing", "cleared", "dropped", "wishlist"] as const

const gameSchema = z
  .object({
    slug: z.string(required('"slug": "stellar-blade"')).regex(SLUG, SLUG_MESSAGE),
    title: z.string(required('"title": "스텔라 블레이드"')).trim().min(1, "제목이 비어 있습니다"),
    platforms: z
      .array(z.string().trim().min(1, "빈 플랫폼 이름입니다"), required('"platforms": ["PC (Steam)"]'))
      .min(1, "플랫폼을 1개 이상 적습니다"),
    // 상태(선택): 없으면 상태 배지 없이 표시
    status: z.enum(GAME_STATUSES, { error: `${GAME_STATUSES.join(" / ")} 중 하나여야 합니다` }).optional(),
    rating: z
      .number({ error: "1~5 사이 정수(숫자)여야 합니다" })
      .int("1~5 사이 정수여야 합니다")
      .min(1, "1~5 사이 정수여야 합니다")
      .max(5, "1~5 사이 정수여야 합니다")
      .optional(),
    comment: z.string().trim().min(1, "소감이 비어 있습니다").optional(),
    // 플레이 시간(시간 단위)
    playtime: z.number({ error: "시간 단위 숫자여야 합니다 (예: 21.5)" }).nonnegative("0 이상이어야 합니다").optional(),
    startedAt: dateString('"startedAt": "2026-03-06"').optional(),
    // 끝낸 날 (클리어 여부와 관계없음)
    endedAt: dateString('"endedAt": "2026-06-29"').optional(),
    // 표지(선택): public/images/games/<연도>/ 아래 파일. 출처 문구(coverCredit)를 함께 적습니다.
    cover: z
      .string()
      .regex(/^\/images\/games\/\d{4}\/(?!.*\.\.)\S+$/, "/images/games/<연도>/로 시작하는 경로여야 합니다")
      .optional(),
    coverCredit: z.string().trim().min(1, "표지 출처가 비어 있습니다").optional(),
  })
  // 모르는 필드(오타 등)는 실패
  .strict()
  .refine((game) => !(game.startedAt && game.endedAt && game.endedAt < game.startedAt), {
    message: "endedAt이 startedAt보다 이릅니다",
    path: ["endedAt"],
  })
  .refine((game) => !game.cover || game.coverCredit, {
    message: "표지(cover)가 있으면 출처(coverCredit)도 적어야 합니다",
    path: ["coverCredit"],
  })

export type Game = z.infer<typeof gameSchema>
export type GameStatus = (typeof GAME_STATUSES)[number]

function readYearFile(dir: string, publicDir: string, file: string, year: number): Game[] {
  const where = `content/games/${file}`

  const text = fs.readFileSync(path.join(dir, file), "utf8")
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (error) {
    throw new Error(`${where}: JSON 형식이 올바르지 않습니다 — ${(error as Error).message}`)
  }
  if (!Array.isArray(data)) {
    throw new Error(`${where}: 게임 목록은 배열([ ... ])이어야 합니다`)
  }

  const seen = new Set<string>()
  return data.map((item, index) => {
    const parsed = gameSchema.safeParse(item)
    if (!parsed.success) {
      throw new Error(`${where}: ${index + 1}번째 게임이 올바르지 않습니다 — ${formatIssues(parsed.error)}`)
    }
    const game = parsed.data
    if (seen.has(game.slug)) {
      throw new Error(`${where}: slug가 중복됩니다 — ${game.slug}`)
    }
    seen.add(game.slug)

    if (game.cover) {
      if (!game.cover.startsWith(`/images/games/${year}/`)) {
        throw new Error(`${where}: ${game.slug}의 표지는 /images/games/${year}/ 아래에 둡니다 — ${game.cover}`)
      }
      if (!fs.statSync(path.join(publicDir, game.cover), { throwIfNoEntry: false })?.isFile()) {
        throw new Error(`${where}: ${game.slug}의 표지 파일이 없습니다 — public${game.cover}`)
      }
    }
    return game
  })
}

/**
 * 폴더 안의 연도별 게임 기록을 모두 읽어 검증합니다 (연도 → 게임 목록).
 * 파일 이름이 네 자리 연도가 아니면 실패합니다. 폴더가 없으면 빈 Map.
 */
export function readGamesDir(dir: string, publicDir: string = PUBLIC_DIR): Map<number, Game[]> {
  const byYear = new Map<number, Game[]>()
  if (!fs.existsSync(dir)) return byYear

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue
    const match = YEAR_FILE.exec(file)
    if (!match) {
      throw new Error(`content/games/${file}: 파일 이름은 네 자리 연도여야 합니다 (예: 2026.json)`)
    }
    const year = Number(match[1])
    byYear.set(year, readYearFile(dir, publicDir, file, year))
  }
  return byYear
}

// 한 번의 렌더 안에서는 폴더를 한 번만 읽습니다.
const loadGames = cache(() => readGamesDir(GAMES_DIR))

/** 기록이 있는 연도 목록 (최신순). */
export function getGameYears(): number[] {
  return [...loadGames().keys()].sort((a, b) => b - a)
}

/**
 * 그해 게임 목록 (파일에 적은 순서). 기록이 없는 연도는 null.
 * 캐시된 배열이므로 읽기 전용입니다. 정렬·묶기는 toSorted() 등으로 복사본을 만들어 씁니다.
 */
export function getGamesByYear(year: number): readonly Game[] | null {
  return loadGames().get(year) ?? null
}
