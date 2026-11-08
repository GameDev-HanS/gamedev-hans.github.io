// 클라이언트 컴포넌트에서 import하면 빌드 단계에서 오류가 나도록 막습니다 (fs 사용)
import "server-only"

import fs from "node:fs"
import path from "node:path"

import { z } from "zod"

// 배경 음악 정보 (F015). 빌드 시 서버에서만 읽습니다.
const MUSIC_JSON = "content/music.json"

const musicSchema = z.object({
  // public/audio/ 안의 mp3 파일 이름만 허용 (경로 구분자·상위 폴더 이동 금지)
  file: z
    .string()
    .regex(/^(?!.*\.\.)[A-Za-z0-9_-][A-Za-z0-9_.-]*\.mp3$/, "public/audio/ 안의 mp3 파일 이름만 적습니다 (예: bgm.mp3)"),
  title: z.string().min(1),
  artist: z.string().min(1),
  source: z.string().min(1),
  // 푸터 링크(href)에 그대로 들어가므로 http·https만 허용 (javascript:·data: 등 차단)
  sourceUrl: z.url({ protocol: /^https?$/ }).optional(),
  license: z.string().min(1),
})

export type BackgroundMusic = Omit<z.infer<typeof musicSchema>, "file"> & {
  /** 브라우저에서 재생할 경로 (basePath 포함) */
  src: string
}

/**
 * content/music.json과 public/audio/<file>이 모두 있을 때만 곡 정보를 돌려줍니다.
 * 둘 중 하나라도 없으면 null (음악 버튼·출처 문구를 숨김). 형식이 틀리면 빌드를 실패시킵니다.
 */
export function getBackgroundMusic(): BackgroundMusic | null {
  const root = process.cwd()
  const jsonPath = path.join(root, MUSIC_JSON)
  if (!fs.existsSync(jsonPath)) return null

  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"))
  } catch (error) {
    throw new Error(`${MUSIC_JSON}: JSON 형식이 올바르지 않습니다. ${(error as Error).message}`)
  }

  const parsed = musicSchema.safeParse(raw)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(전체)"}: ${issue.message}`)
      .join(", ")
    throw new Error(`${MUSIC_JSON}: 배경 음악 정보가 올바르지 않습니다 — ${issues}`)
  }

  const { file, ...info } = parsed.data
  if (!fs.existsSync(path.join(root, "public", "audio", file))) return null

  const basePath = process.env.PAGES_BASE_PATH ?? ""
  return { ...info, src: `${basePath}/audio/${file}` }
}
