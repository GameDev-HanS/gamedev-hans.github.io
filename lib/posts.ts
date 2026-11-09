// 클라이언트 컴포넌트에서 import하면 빌드 단계에서 오류가 나도록 막습니다 (fs 사용)
import "server-only"

import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"
import { cache } from "react"
import { z } from "zod"

import { SLUG, SLUG_MESSAGE, dateString, formatIssues, required } from "./schema"

// 블로그 글 데이터 로더. content/posts/*.mdx의 맨 위 YAML(frontmatter)을 읽고 검증합니다.
// 형식이 틀리면 파일 이름이 들어간 메시지로 빌드를 실패시켜 잘못된 글이 배포되지 않게 합니다.
const POSTS_DIR = path.join(process.cwd(), "content", "posts")
const PUBLIC_DIR = path.join(process.cwd(), "public")

const frontmatterSchema = z.object({
  title: z.string(required("title: 게임 루프 이해하기")).trim().min(1, "제목이 비어 있습니다"),
  // YAML은 2026-11-09를 Date로 읽으므로 문자열 YYYY-MM-DD로 맞춘 뒤 검사
  date: z.preprocess(
    (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
    dateString("date: 2026-11-09")
  ),
  summary: z.string(required("summary: 한 줄 요약")).trim().min(1, "요약이 비어 있습니다"),
  tags: z
    .array(z.string().regex(SLUG, SLUG_MESSAGE), required("tags: [game-programming, devlog]"))
    .min(1, "태그를 1개 이상 적습니다"),
  // 대표 이미지(선택): public/images/posts/ 아래 파일 경로
  thumbnail: z
    .string()
    .regex(/^\/images\/posts\/(?!.*\.\.)\S+$/, "/images/posts/로 시작하는 경로여야 합니다")
    .optional(),
})

export type Post = z.infer<typeof frontmatterSchema> & {
  /** 파일 이름 (URL: /blog/<slug>) */
  slug: string
}

function readPost(file: string): Post {
  const where = `content/posts/${file}`
  const slug = file.replace(/\.mdx$/, "")
  if (!SLUG.test(slug)) {
    throw new Error(`${where}: 파일 이름은 ${SLUG_MESSAGE}`)
  }

  const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"))
  const parsed = frontmatterSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`${where}: 글 정보(frontmatter)가 올바르지 않습니다 — ${formatIssues(parsed.error)}`)
  }

  const { thumbnail } = parsed.data
  if (thumbnail && !fs.existsSync(path.join(PUBLIC_DIR, thumbnail))) {
    throw new Error(`${where}: thumbnail 파일이 없습니다 — public${thumbnail}`)
  }

  return { slug, ...parsed.data }
}

/**
 * 모든 글을 최신순(날짜 내림차순, 같은 날이면 slug순)으로 돌려줍니다. 글 폴더가 없으면 빈 배열.
 * React cache로 한 번의 렌더(페이지·generateMetadata) 안에서는 파일을 한 번만 읽습니다.
 */
export const getAllPosts = cache((): Post[] => {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map(readPost)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
})

/** slug에 해당하는 글을 돌려주고, 없으면 null. */
export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null
}
