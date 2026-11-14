// 클라이언트 컴포넌트에서 import하면 빌드 단계에서 오류가 나도록 막습니다 (fs 사용)
import "server-only"

import fs from "node:fs"
import path from "node:path"

import { cache } from "react"
import { z } from "zod"

import { GAME_STATUSES, type GameStatus } from "./game-status"
import { UI, type Locale } from "./i18n"
import { SLUG, SLUG_MESSAGE, dateString, formatIssues, required } from "./schema"

export { GAME_STATUSES, type GameStatus }

// 플레이 게임 기록 로더. content/games/<연도>.json과 earlier.json(게임 배열)을 읽고 검증합니다.
// 형식이 틀리면 파일 이름이 들어간 메시지로 빌드를 실패시켜 잘못된 기록이 배포되지 않게 합니다.
const GAMES_DIR = path.join(process.cwd(), "content", "games")
const PUBLIC_DIR = path.join(process.cwd(), "public")

const YEAR_FILE = /^(\d{4})\.json$/

const gameSchema = z
  .object({
    slug: z.string(required('"slug": "stellar-blade"')).regex(SLUG, SLUG_MESSAGE),
    title: z.string(required('"title": "스텔라 블레이드"')).trim().min(1, "제목이 비어 있습니다"),
    // 영어 페이지(/en/games)에서 보일 공식 영문 이름(선택, v1.1.2). 없으면 title 그대로
    titleEn: z.string().trim().min(1, "영문 이름이 비어 있습니다").optional(),
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
    // 영어 소감(선택, v1.1.2). 없으면 영어 페이지에서는 소감을 숨깁니다
    commentEn: z.string().trim().min(1, "영어 소감이 비어 있습니다").optional(),
    // 플레이 시간(시간 단위)
    playtime: z.number({ error: "시간 단위 숫자여야 합니다 (예: 21.5)" }).nonnegative("0 이상이어야 합니다").optional(),
    startedAt: dateString('"startedAt": "2026-03-06"').optional(),
    // 끝낸 날 (클리어 여부와 관계없음)
    endedAt: dateString('"endedAt": "2026-06-29"').optional(),
    // 표지(선택): public/images/games/<연도 또는 earlier>/ 아래 파일. 출처 문구(coverCredit)를 함께 적습니다.
    // 파일마다 맞는 폴더인지는 readGameFile에서 따로 검사합니다.
    cover: z
      .string()
      .regex(
        /^\/images\/games\/(\d{4}|earlier)\/(?!.*\.\.)\S+$/,
        "/images/games/<연도 또는 earlier>/로 시작하는 경로여야 합니다"
      )
      .optional(),
    coverCredit: z.string().trim().min(1, "표지 출처가 비어 있습니다").optional(),
    // 공식 PV(선택): 유튜브 영상 ID 11자 (예: https://www.youtube.com/watch?v=qgJBFa952mY 의 qgJBFa952mY)
    trailer: z
      .string()
      .regex(/^[A-Za-z0-9_-]{11}$/, "유튜브 영상 ID(11자)여야 합니다 (예: qgJBFa952mY)")
      .optional(),
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
  .refine((game) => !game.commentEn || game.comment, {
    message: "영어 소감(commentEn)은 한국어 소감(comment)이 있을 때만 적습니다",
    path: ["commentEn"],
  })

export type Game = z.infer<typeof gameSchema>

// coverDir: 표지를 둘 폴더 이름 (연도 파일은 "2026", earlier.json은 "earlier")
function readGameFile(dir: string, publicDir: string, file: string, coverDir: string): Game[] {
  const where = `content/games/${file}`

  // Windows 편집기가 붙이는 BOM(파일 맨 앞의 보이지 않는 문자)은 JSON 오류가 되므로 떼고 읽습니다
  const text = fs.readFileSync(path.join(dir, file), "utf8").replace(/^\uFEFF/, "")
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
      if (!game.cover.startsWith(`/images/games/${coverDir}/`)) {
        throw new Error(`${where}: ${game.slug}의 표지는 /images/games/${coverDir}/ 아래에 둡니다 — ${game.cover}`)
      }
      if (!fs.statSync(path.join(publicDir, game.cover), { throwIfNoEntry: false })?.isFile()) {
        throw new Error(`${where}: ${game.slug}의 표지 파일이 없습니다 — public${game.cover}`)
      }
    }
    return game
  })
}

/** 2026 이전에만 플레이해 정확한 연도가 없는 게임 (전체 보기에만 나옴) */
const EARLIER_FILE = "earlier.json"

export type GamesData = {
  /** 연도 → 그해 게임 */
  byYear: Map<number, Game[]>
  /** earlier.json의 게임 */
  earlier: Game[]
}

/**
 * 폴더 안의 게임 기록을 모두 읽어 검증합니다: 연도 파일(2026.json 등)과 earlier.json.
 * 그 밖의 이름이면 실패합니다. 폴더가 없으면 빈 결과.
 */
export function readGamesDir(dir: string, publicDir: string = PUBLIC_DIR): GamesData {
  const data: GamesData = { byYear: new Map(), earlier: [] }
  if (!fs.existsSync(dir)) return data

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue
    if (file === EARLIER_FILE) {
      data.earlier = readGameFile(dir, publicDir, file, "earlier")
      continue
    }
    const match = YEAR_FILE.exec(file)
    if (!match) {
      throw new Error(
        `content/games/${file}: 파일 이름은 네 자리 연도(예: 2026.json) 또는 ${EARLIER_FILE}이어야 합니다`
      )
    }
    data.byYear.set(Number(match[1]), readGameFile(dir, publicDir, file, match[1]))
  }

  // earlier.json은 "2026 이전에만 플레이한 게임"이라 연도 파일과 겹치면 잘못 넣은 것으로 보고 실패합니다.
  // (연도 파일끼리 겹치는 것은 여러 해에 걸쳐 플레이한 경우라 허용)
  const yearSlugs = new Set([...data.byYear.values()].flat().map((game) => game.slug))
  const overlap = data.earlier.filter((game) => yearSlugs.has(game.slug)).map((game) => game.slug)
  if (overlap.length > 0) {
    throw new Error(
      `content/games/${EARLIER_FILE}: 연도 파일에도 있는 게임입니다 — ${overlap.join(", ")} (해당 연도 파일에만 두세요)`
    )
  }
  return data
}

// 한 번의 렌더 안에서는 폴더를 한 번만 읽습니다.
const loadGames = cache(() => readGamesDir(GAMES_DIR))

/** 주소의 연도("2026")를 숫자로. 네 자리 숫자가 아니면 null (/games/[year], /en/games/[year] 공용) */
export function parseYear(value: string): number | null {
  return /^\d{4}$/.test(value) ? Number(value) : null
}

/** 기록이 있는 연도 목록 (최신순, earlier.json 제외). */
export function getGameYears(): number[] {
  return [...loadGames().byYear.keys()].sort((a, b) => b - a)
}

/**
 * 그해 게임 목록 (파일에 적은 순서). 기록이 없는 연도는 null.
 * 캐시된 배열이므로 읽기 전용입니다. 정렬·묶기는 toSorted() 등으로 복사본을 만들어 씁니다.
 */
export function getGamesByYear(year: number): readonly Game[] | null {
  return loadGames().byYear.get(year) ?? null
}

/** 모든 연도와 earlier.json의 게임을 합친 목록. 같은 게임(slug)은 가장 최근 연도 것 하나만. */
export function mergeGames(data: GamesData): Game[] {
  const lists = [
    ...[...data.byYear.entries()].sort(([a], [b]) => b - a).map(([, games]) => games),
    data.earlier,
  ]
  // 최근 연도부터 넣으므로, 같은 slug는 처음 넣은 것(가장 최근 연도)이 남습니다
  const bySlug = new Map<string, Game>()
  for (const game of lists.flat()) {
    if (!bySlug.has(game.slug)) bySlug.set(game.slug, game)
  }
  return [...bySlug.values()]
}

/** 전체 보기용 게임 목록 (읽기 전용) */
export const getAllGames = cache((): readonly Game[] => mergeGames(loadGames()))

/**
 * 화면 언어에 맞춘 게임 목록 (v1.1.2). 컴포넌트는 title·comment·platforms만 읽으면 됩니다.
 * en: 제목은 titleEn(없으면 title), 소감은 commentEn(없으면 숨김), 플랫폼 이름은 영어로. ko는 그대로.
 */
export function localizeGames(games: readonly Game[], locale: Locale): readonly Game[] {
  if (locale === "ko") return games
  const platformName = UI.en.games.platformName
  return games.map((game) => ({
    ...game,
    title: game.titleEn ?? game.title,
    comment: game.commentEn,
    // Object.hasOwn: "constructor" 같은 기본 속성 이름이 섞여도 엉뚱한 값을 꺼내지 않게
    platforms: game.platforms.map((platform) =>
      Object.hasOwn(platformName, platform) ? platformName[platform] : platform
    ),
  }))
}

export type GameGroup = {
  /** 상태 값, 상태가 없는 묶음은 "none" */
  key: GameStatus | "none"
  label: string
  games: Game[]
}

// 묶음 안 순서: 시작일 최신순, 시작일이 없으면 뒤로 보내고 제목순 (제목은 화면 언어 기준으로 정렬)
function compareGames(locale: Locale) {
  return (a: Game, b: Game): number => {
    if (a.startedAt && b.startedAt) {
      return b.startedAt.localeCompare(a.startedAt) || a.title.localeCompare(b.title, locale)
    }
    if (a.startedAt) return -1
    if (b.startedAt) return 1
    return a.title.localeCompare(b.title, locale)
  }
}

/**
 * 상태별 묶음: 플레이 중 → 클리어 → 중단 → 하고 싶은 게임 → 플레이한 게임(상태 없음).
 * 묶음 이름은 locale 언어로. 게임이 없는 묶음은 빼고 돌려줍니다. 받은 배열은 바꾸지 않습니다.
 */
export function groupGames(games: readonly Game[], locale: Locale = "ko"): GameGroup[] {
  const t = UI[locale].games
  const groups: GameGroup[] = [
    ...GAME_STATUSES.map((status) => ({
      key: status,
      label: t.status[status],
      games: games.filter((game) => game.status === status),
    })),
    { key: "none", label: t.noStatus, games: games.filter((game) => !game.status) },
  ]
  return groups
    .filter((group) => group.games.length > 0)
    .map((group) => ({ ...group, games: group.games.toSorted(compareGames(locale)) }))
}

/** 묶음별 게임 수 (요약 줄용, 0개 묶음 제외) */
export function countGroups(games: readonly Game[], locale: Locale = "ko"): { label: string; count: number }[] {
  return groupGames(games, locale).map((group) => ({ label: group.label, count: group.games.length }))
}
