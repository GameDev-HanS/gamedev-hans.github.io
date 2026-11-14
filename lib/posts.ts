// 클라이언트 컴포넌트에서 import하면 빌드 단계에서 오류가 나도록 막습니다 (fs 사용)
import "server-only"

import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"
import { cache } from "react"
import remarkGfm from "remark-gfm"
import remarkMdx from "remark-mdx"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import { z } from "zod"

import { SLUG, SLUG_MESSAGE, dateString, formatIssues, required } from "./schema"

// 블로그 글 데이터 로더. content/posts/*.mdx의 맨 위 YAML(frontmatter)을 읽고 검증합니다.
// 형식이 틀리면 파일 이름이 들어간 메시지로 빌드를 실패시켜 잘못된 글이 배포되지 않게 합니다.
const POSTS_DIR = path.join(process.cwd(), "content", "posts")
const PUBLIC_DIR = path.join(process.cwd(), "public")

// 태그 선택 목록의 '전체' 보기와 겹치지 않도록 태그 slug로 쓸 수 없는 이름
const RESERVED_TAG = "all"
const RESERVED_TAG_MESSAGE = `"${RESERVED_TAG}"는 '전체' 보기용 이름이라 태그로 쓸 수 없습니다`

const frontmatterSchema = z.object({
  title: z.string(required("title: 게임 루프 이해하기")).trim().min(1, "제목이 비어 있습니다"),
  // YAML은 2026-11-09를 Date로 읽으므로 문자열 YYYY-MM-DD로 맞춘 뒤 검사
  date: z.preprocess(
    (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
    dateString("date: 2026-11-09")
  ),
  summary: z.string(required("summary: 한 줄 요약")).trim().min(1, "요약이 비어 있습니다"),
  tags: z
    .array(
      z.string().regex(SLUG, SLUG_MESSAGE).refine((tag) => tag !== RESERVED_TAG, RESERVED_TAG_MESSAGE),
      required("tags: [game-programming, devlog]")
    )
    .min(1, "태그를 1개 이상 적습니다")
    // 같은 태그가 두 번 있으면 칩이 겹쳐 보이므로 막습니다
    .refine((tags) => new Set(tags).size === tags.length, "같은 태그가 두 번 적혀 있습니다"),
  // 대표 이미지(선택): public/images/posts/ 아래 파일 경로
  thumbnail: z
    .string()
    .regex(/^\/images\/posts\/(?!.*\.\.)\S+$/, "/images/posts/로 시작하는 경로여야 합니다")
    .optional(),
})

// 태그 표시 이름 대응표 content/tags.json: { "영문 slug": "화면에 보일 이름" }
const TAGS_JSON = "content/tags.json"
const tagLabelsSchema = z
  .record(z.string(), z.string("표시 이름은 문자열이어야 합니다").trim().min(1, "표시 이름이 비어 있습니다"))
  // 키 검사는 record의 키 스키마 대신 여기서 합니다 (키 스키마 메시지는 zod 기본 영어 문구로 바뀌어 보임)
  .superRefine((labels, ctx) => {
    for (const key of Object.keys(labels)) {
      if (!SLUG.test(key)) {
        ctx.addIssue({ code: "custom", path: [key], message: `키(태그 slug)는 ${SLUG_MESSAGE}` })
      } else if (key === RESERVED_TAG) {
        ctx.addIssue({ code: "custom", path: [key], message: RESERVED_TAG_MESSAGE })
      }
    }
  })

/** 화면에 보일 태그. slug는 URL(/blog/tags/<slug>), label은 표시 이름 */
export type Tag = { slug: string; label: string }

export type Post = Omit<z.infer<typeof frontmatterSchema>, "tags"> & {
  /** 파일 이름 (URL: /blog/<slug>) */
  slug: string
  /** frontmatter 순서 그대로, 표시 이름을 붙인 태그 */
  tags: Tag[]
  /** 본문에 <Video> 컴포넌트가 있는지 (빌드 시 계산, 목록 카드의 "영상" 표시) */
  hasVideo: boolean
  /** 영어 번역본(content/posts/en/<slug>.mdx)이 있는지 (목록 카드의 "EN" 표시, 언어 전환) */
  hasEnglish: boolean
}

// MDX 본문을 문법 트리로 읽는 파서. MDX 빌드(next.config.ts)와 같은 문법 규칙(remark-mdx + remark-gfm)을 씁니다.
// frontmatter는 gray-matter가 이미 떼어 낸 본문을 넘기므로 remark-frontmatter는 필요 없습니다.
const mdxParser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm)

// 같은 본문은 한 번만 해석합니다. getAllPosts()는 React cache라 정적 빌드에서 페이지마다 다시 불리므로,
// 본문 내용을 키로 결과를 모듈에 기억해 둡니다 (내용이 바뀌면 키가 달라져 다시 해석)
const hasVideoMemo = new Map<string, boolean>()

/**
 * 본문(frontmatter 제외)에 <Video> 컴포넌트가 있는지 검사합니다.
 * 정규식 대신 MDX 문법 트리에서 JSX 요소 이름으로 찾으므로, 코드 블록·인라인 코드(목록·인용 안 포함)와
 * {/* 주석 *\/} 안에 예시로 적은 <Video>는 세지 않습니다.
 */
function hasVideoTag(content: string, where: string): boolean {
  const memo = hasVideoMemo.get(content)
  if (memo !== undefined) return memo

  let tree
  try {
    tree = mdxParser.parse(content)
  } catch (error) {
    // MDX 문법 오류는 어차피 글 렌더링에서도 빌드가 실패하므로, 파일 이름을 붙여 먼저 알립니다
    throw new Error(`${where}: MDX 본문을 읽을 수 없습니다 — ${(error as Error).message}`)
  }
  let found = false
  visit(tree, (node) => {
    // node.type으로 좁히면 name(string | null)이 있는 MDX JSX 노드 타입이 됩니다 (프래그먼트 <>는 null)
    if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && node.name === "Video") {
      found = true
    }
  })
  hasVideoMemo.set(content, found)
  return found
}

/**
 * 태그 slug → 표시 이름 대응표. 파일이 없으면 빈 대응표(모든 태그를 slug 그대로 표시)이고,
 * JSON이나 형식이 틀리면 빌드를 실패시킵니다. 대응표에만 있고 글에 안 쓰인 태그는 괜찮습니다.
 */
const getTagLabels = cache((): Record<string, string> => {
  const full = path.join(process.cwd(), TAGS_JSON)
  if (!fs.existsSync(full)) return {}

  // Windows 편집기가 붙이는 BOM(파일 맨 앞의 보이지 않는 문자)은 JSON 오류가 되므로 떼고 읽습니다
  const text = fs.readFileSync(full, "utf8")
  const raw = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (error) {
    throw new Error(`${TAGS_JSON}: JSON 형식이 올바르지 않습니다 — ${(error as Error).message}`)
  }

  const parsed = tagLabelsSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`${TAGS_JSON}: 태그 표시 이름 대응표가 올바르지 않습니다 — ${formatIssues(parsed.error)}`)
  }
  return parsed.data
})

function toTag(slug: string): Tag {
  // 대응표에 없는 태그는 slug를 그대로 표시 (hasOwn: "constructor" 같은 기본 속성 이름을 피함)
  const labels = getTagLabels()
  return { slug, label: Object.hasOwn(labels, slug) ? labels[slug] : slug }
}

/** 글 폴더의 .mdx 파일 이름 목록 (en/ 같은 하위 폴더는 .mdx로 끝나지 않아 빠짐) */
function listMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((file) => file.endsWith(".mdx"))
}

function readPost(file: string): Post {
  const where = `content/posts/${file}`
  const slug = file.replace(/\.mdx$/, "")
  if (!SLUG.test(slug)) {
    throw new Error(`${where}: 파일 이름은 ${SLUG_MESSAGE}`)
  }

  const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"))
  const parsed = frontmatterSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`${where}: 글 정보(frontmatter)가 올바르지 않습니다 — ${formatIssues(parsed.error)}`)
  }

  const { thumbnail } = parsed.data
  if (thumbnail && !fs.existsSync(path.join(PUBLIC_DIR, thumbnail))) {
    throw new Error(`${where}: thumbnail 파일이 없습니다 — public${thumbnail}`)
  }

  return {
    slug,
    ...parsed.data,
    tags: parsed.data.tags.map(toTag),
    hasVideo: hasVideoTag(content, where),
    hasEnglish: getEnglishEntries().has(slug),
  }
}

/**
 * 모든 글을 최신순(날짜 내림차순, 같은 날이면 slug순)으로 돌려줍니다. 글 폴더가 없으면 빈 배열.
 * React cache로 한 번의 렌더(페이지·generateMetadata) 안에서는 파일을 한 번만 읽습니다.
 */
export const getAllPosts = cache((): Post[] =>
  listMdx(POSTS_DIR)
    .map(readPost)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
)

// ── 영어판 (v1.1.0) ────────────────────────────────────────────────
// content/posts/en/<slug>.mdx: 한국어 글과 같은 파일 이름으로 번역본을 둡니다.
// frontmatter에는 title·summary만 적고, 날짜·태그·대표 이미지는 한국어 원문 것을 씁니다.
const EN_POSTS_DIR = path.join(POSTS_DIR, "en")

const enFrontmatterSchema = z
  .object({
    title: z.string(required("title: Understanding the Game Loop")).trim().min(1, "제목이 비어 있습니다"),
    summary: z.string(required("summary: One-line summary")).trim().min(1, "요약이 비어 있습니다"),
  })
  // date·tags 등을 적으면 원문과 어긋날 수 있으므로 막습니다 (원문 값을 씀)
  .strict()

type EnglishEntry = z.infer<typeof enFrontmatterSchema> & { hasVideo: boolean }

/** 번역본 slug → 제목·요약·영상 여부. 원문(content/posts/<slug>.mdx)이 없는 번역본은 빌드 실패. */
const getEnglishEntries = cache((): Map<string, EnglishEntry> => {
  const koSlugs = new Set(listMdx(POSTS_DIR).map((file) => file.replace(/\.mdx$/, "")))
  const entries = new Map<string, EnglishEntry>()
  for (const file of listMdx(EN_POSTS_DIR)) {
    const where = `content/posts/en/${file}`
    const slug = file.replace(/\.mdx$/, "")
    if (!koSlugs.has(slug)) {
      throw new Error(`${where}: 같은 이름의 한국어 원문(content/posts/${file})이 없습니다 — 번역본은 원문과 같은 파일 이름으로 둡니다`)
    }
    const { data, content } = matter(fs.readFileSync(path.join(EN_POSTS_DIR, file), "utf8"))
    const parsed = enFrontmatterSchema.safeParse(data)
    if (!parsed.success) {
      throw new Error(
        `${where}: 영어 글 정보(frontmatter)가 올바르지 않습니다 (title·summary만 적습니다) — ${formatIssues(parsed.error)}`
      )
    }
    entries.set(slug, { ...parsed.data, hasVideo: hasVideoTag(content, where) })
  }
  return entries
})

/** 원문 글을 영어판으로: 제목·요약·영상 여부는 번역본, 태그는 영문 slug를 그대로 표시 이름으로 */
function toEnglish(post: Post, entry: EnglishEntry): Post {
  return {
    ...post,
    title: entry.title,
    summary: entry.summary,
    hasVideo: entry.hasVideo,
    tags: post.tags.map((tag) => ({ slug: tag.slug, label: tag.slug })),
  }
}

/** 번역본이 있는 글을 영어판으로, 최신순(getAllPosts()와 같은 순서)으로 돌려줍니다. */
export const getAllEnglishPosts = cache((): Post[] => {
  const entries = getEnglishEntries()
  return getAllPosts().flatMap((post) => {
    const entry = entries.get(post.slug)
    return entry ? [toEnglish(post, entry)] : []
  })
})

/** slug의 영어판 글. 번역본이 없으면 null. */
export function getEnglishPostBySlug(slug: string): Post | null {
  return getAllEnglishPosts().find((post) => post.slug === slug) ?? null
}

/** 영어판 글 사이의 앞뒤 글 (번역본이 있는 글끼리만, getAdjacentPosts와 같은 방향) */
export function getAdjacentEnglishPosts(slug: string): { prev: Post | null; next: Post | null } {
  return adjacent(getAllEnglishPosts(), slug)
}

/**
 * 글에 쓰인 모든 태그와 글 수. 글 수가 많은 순, 같으면 slug순입니다.
 * (한 글 안의 태그 중복은 frontmatter 검증에서 막습니다)
 */
export const getAllTags = cache((): (Tag & { count: number })[] => {
  const counts = new Map<string, Tag & { count: number }>()
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      const entry = counts.get(tag.slug)
      if (entry) entry.count += 1
      else counts.set(tag.slug, { ...tag, count: 1 })
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
})

/** 그 태그가 붙은 글을 최신순으로 돌려줍니다 (getAllPosts()와 같은 순서). 없으면 빈 배열. */
export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((post) => post.tags.some((item) => item.slug === tag))
}

/** slug에 해당하는 글을 돌려주고, 없으면 null. */
export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null
}

/**
 * 날짜순으로 바로 앞뒤 글을 돌려줍니다. prev는 더 오래된 글, next는 더 최근 글이고 없으면 null.
 * 순서는 getAllPosts()와 같습니다 (같은 날이면 slug순).
 */
export function getAdjacentPosts(slug: string): { prev: Post | null; next: Post | null } {
  return adjacent(getAllPosts(), slug)
}

function adjacent(posts: Post[], slug: string): { prev: Post | null; next: Post | null } {
  const index = posts.findIndex((post) => post.slug === slug)
  if (index === -1) return { prev: null, next: null }
  return {
    // 목록이 최신순이라 뒤쪽(index + 1)이 더 오래된 글
    prev: posts[index + 1] ?? null,
    next: posts[index - 1] ?? null,
  }
}
