// 클라이언트 컴포넌트에서 import하면 빌드 단계에서 오류가 나도록 막습니다 (fs 사용)
import "server-only"

import fs from "node:fs"
import path from "node:path"

import { cache } from "react"
import * as simpleIcons from "simple-icons"
import { z } from "zod"

import type { Locale } from "./i18n"
import { SLUG, SLUG_MESSAGE, formatIssues, required } from "./schema"

// 소개 데이터 로더 (F001~F004). content/의 profile·skills·projects·timeline.json을 읽고 검증합니다.
// 형식이 틀리면 파일 이름이 들어간 메시지로 빌드를 실패시켜 잘못된 데이터가 배포되지 않게 합니다.
const CONTENT_DIR = path.join(process.cwd(), "content")
const PUBLIC_DIR = path.join(process.cwd(), "public")

// simple-icons에 있는 아이콘 이름(slug) 목록. 서버 전용이라 클라이언트 번들에는 들어가지 않습니다.
const ICON_SLUGS = new Set(Object.values(simpleIcons).map((icon) => icon.slug))

const text = (example: string, empty: string) => z.string(required(example)).trim().min(1, empty)

// 화면 링크(href)에 그대로 들어가므로 http·https만 허용 (mailto:·tel:·javascript: 등 차단)
const httpUrl = (example: string) =>
  z.url({
    protocol: /^https?$/,
    error: `http/https 주소여야 합니다 — 이메일·전화번호 링크는 넣지 않습니다 (예: ${example})`,
  })

// simple-icons 아이콘 이름. 적었는데 없는 이름이면 실패 (오타가 조용히 이니셜로 바뀌지 않게)
const iconSlug = z
  .string()
  .refine((slug) => ICON_SLUGS.has(slug), {
    error: (issue) => `simple-icons에 없는 아이콘입니다 — '${String(issue.input)}' (비우면 이니셜로 표시됩니다)`,
  })

// public/<폴더>/ 아래 이미지 경로 (상위 폴더 이동 금지). 파일 존재는 assertFile에서 확인합니다.
const imagePath = (dir: string) =>
  z.string().regex(new RegExp(`^/images/${dir}/(?!.*\\.\\.)\\S+$`), `/images/${dir}/로 시작하는 경로여야 합니다`)

const profileSchema = z
  .object({
    name: text('"name": "HanS"', "이름이 비어 있습니다"),
    tagline: text('"tagline": "인디 게임을 만드는 개발자"', "한 줄 소개가 비어 있습니다"),
    photo: imagePath("profile").optional(),
    interests: z.array(z.string().trim().min(1, "빈 항목입니다"), required('"interests": ["게임 AI"]')),
    studying: z.array(z.string().trim().min(1, "빈 항목입니다"), required('"studying": ["셰이더"]')),
    links: z.array(
      z
        .object({
          label: text('"label": "GitHub"', "링크 이름이 비어 있습니다"),
          url: httpUrl("https://github.com/아이디"),
          icon: iconSlug.optional(),
        })
        .strict(),
      required('"links": [{ "label": "GitHub", "url": "https://github.com/아이디" }]')
    ),
  })
  .strict()

// language = 언어, engine = 게임 엔진, os = 운영체제, ide = IDE, etc = 기타 (화면 순서도 이 순서)
export const SKILL_CATEGORIES = ["language", "engine", "os", "ide", "etc"] as const
export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

const skillSchema = z
  .object({
    name: text('"name": "Unity"', "기술 이름이 비어 있습니다"),
    category: z.enum(SKILL_CATEGORIES, { error: `${SKILL_CATEGORIES.join(" / ")} 중 하나여야 합니다` }),
    icon: iconSlug.optional(),
  })
  .strict()

const projectSchema = z
  .object({
    slug: z.string(required('"slug": "my-game"')).regex(SLUG, SLUG_MESSAGE),
    title: text('"title": "프로젝트 이름"', "제목이 비어 있습니다"),
    summary: text('"summary": "한두 줄 설명"', "요약이 비어 있습니다"),
    thumbnail: imagePath("projects").optional(),
    stack: z
      .array(z.string().trim().min(1, "빈 기술 이름입니다"), required('"stack": ["Unity", "C#"]'))
      .min(1, "사용 기술을 1개 이상 적습니다"),
    link: httpUrl("https://store.steampowered.com/app/...").optional(),
  })
  .strict()

// work = 경력, education = 학력·교육 과정, certificate = 자격증
export const TIMELINE_TYPES = ["work", "education", "certificate"] as const

const timelineSchema = z
  .object({
    period: text('"period": "2023.03 – 현재"', "기간이 비어 있습니다"),
    title: text('"title": "게임 클라이언트 개발자"', "직함·과정명이 비어 있습니다"),
    organization: text('"organization": "회사·학교 이름"', "회사·학교 이름이 비어 있습니다"),
    type: z.enum(TIMELINE_TYPES, { error: `${TIMELINE_TYPES.join(" / ")} 중 하나여야 합니다` }),
    description: z.string().trim().min(1, "설명이 비어 있습니다").optional(),
  })
  .strict()

export type Profile = z.infer<typeof profileSchema>
export type Skill = z.infer<typeof skillSchema>
export type Project = z.infer<typeof projectSchema>
export type TimelineItem = z.infer<typeof timelineSchema>

/** content/<file>을 읽어 JSON으로 돌려줍니다. 파일이 없거나 JSON이 틀리면 실패. */
function readJson(file: string): unknown {
  const full = path.join(CONTENT_DIR, file)
  if (!fs.existsSync(full)) {
    throw new Error(`content/${file}: 파일이 없습니다 (홈 소개 섹션·푸터에 필요한 데이터입니다)`)
  }
  // Windows 편집기가 붙이는 BOM(파일 맨 앞의 보이지 않는 문자)은 JSON 오류가 되므로 떼고 읽습니다
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "")
  try {
    return JSON.parse(raw)
  } catch (error) {
    throw new Error(`content/${file}: JSON 형식이 올바르지 않습니다 — ${(error as Error).message}`)
  }
}

/** 배열 파일을 항목마다 검증합니다. 메시지에 "n번째 <항목>"을 넣습니다. */
function readList<T>(file: string, schema: z.ZodType<T>, itemName: string): T[] {
  const data = readJson(file)
  if (!Array.isArray(data)) {
    throw new Error(`content/${file}: ${itemName} 목록은 배열([ ... ])이어야 합니다`)
  }
  return data.map((item, index) => {
    const parsed = schema.safeParse(item)
    if (!parsed.success) {
      throw new Error(`content/${file}: ${index + 1}번째 ${itemName} 항목이 올바르지 않습니다 — ${formatIssues(parsed.error)}`)
    }
    return parsed.data
  })
}

/** 같은 키가 두 번 나오면 실패 */
function assertUnique<T>(file: string, items: readonly T[], key: (item: T) => string, label: string) {
  const seen = new Set<string>()
  for (const item of items) {
    const value = key(item)
    if (seen.has(value)) throw new Error(`content/${file}: 중복된 ${label}입니다 — ${value}`)
    seen.add(value)
  }
}

/** public/ 아래 이미지 파일이 실제로 있는지 확인 */
function assertFile(file: string, owner: string, src: string) {
  if (!fs.statSync(path.join(PUBLIC_DIR, src), { throwIfNoEntry: false })?.isFile()) {
    throw new Error(`content/${file}: ${owner}의 이미지 파일이 없습니다 — public${src}`)
  }
}

// 영어판(v1.1.0) content/en/profile.json: 글자 항목만 번역하고 사진·링크는 한국어 파일 것을 씁니다
const enProfileSchema = profileSchema.pick({ name: true, tagline: true, interests: true, studying: true }).strict()

/** 프로필 (이름·한 줄 소개·사진·관심 분야·공부 중인 것·외부 링크). en이면 글자 항목을 영어판으로 바꿉니다. */
export const getProfile = cache((locale: Locale = "ko"): Profile => {
  const base = getKoProfile()
  if (locale === "ko") return base
  const file = "en/profile.json"
  const parsed = enProfileSchema.safeParse(readJson(file))
  if (!parsed.success) {
    throw new Error(`content/${file}: 영어 프로필이 올바르지 않습니다 — ${formatIssues(parsed.error)}`)
  }
  return { ...base, ...parsed.data }
})

const getKoProfile = cache((): Profile => {
  const file = "profile.json"
  const parsed = profileSchema.safeParse(readJson(file))
  if (!parsed.success) {
    throw new Error(`content/${file}: 프로필이 올바르지 않습니다 — ${formatIssues(parsed.error)}`)
  }
  if (parsed.data.photo) assertFile(file, "프로필 사진", parsed.data.photo)
  // 같은 주소가 두 번 있으면 푸터에 링크가 겹쳐 보이므로 실패
  assertUnique(file, parsed.data.links, (link) => link.url, "링크 주소")
  return parsed.data
})

/** 기술 스택 (파일에 적은 순서, 읽기 전용) */
export const getSkills = cache((): readonly Skill[] => {
  const file = "skills.json"
  const skills = readList(file, skillSchema, "기술")
  assertUnique(file, skills, (skill) => skill.name, "기술 이름")
  return skills
})

/** 대표 프로젝트 (파일에 적은 순서, 읽기 전용). stack은 skills.json의 이름만 허용합니다. */
export const getProjects = cache((): readonly Project[] => {
  const file = "projects.json"
  const projects = readList(file, projectSchema, "프로젝트")
  assertUnique(file, projects, (project) => project.slug, "slug")

  const skillNames = new Set(getSkills().map((skill) => skill.name))
  for (const project of projects) {
    // 같은 기술을 두 번 적으면 배지가 두 번 보이므로 실패
    const repeated = project.stack.filter((name, index) => project.stack.indexOf(name) !== index)
    if (repeated.length > 0) {
      throw new Error(`content/${file}: ${project.slug}의 stack에 같은 기술이 두 번 있습니다 — ${repeated.join(", ")}`)
    }
    const unknown = project.stack.filter((name) => !skillNames.has(name))
    if (unknown.length > 0) {
      throw new Error(
        `content/${file}: ${project.slug}의 stack에 skills.json에 없는 기술이 있습니다 — ${unknown.join(", ")}`
      )
    }
    if (project.thumbnail) assertFile(file, project.slug, project.thumbnail)
  }
  return projects
})

/**
 * 경력·학력 (파일에 적은 순서 = 화면 순서, 읽기 전용). en이면 content/en/timeline.json을 읽고,
 * 한국어 파일과 항목 수·순서별 type이 같은지 확인합니다 (번역 누락·순서 어긋남을 빌드에서 잡음).
 */
export const getTimeline = cache((locale: Locale = "ko"): readonly TimelineItem[] => {
  const ko = readList("timeline.json", timelineSchema, "경력·학력")
  if (locale === "ko") return ko
  const file = "en/timeline.json"
  const en = readList(file, timelineSchema, "경력·학력")
  if (en.length !== ko.length) {
    throw new Error(`content/${file}: 항목 수가 timeline.json과 다릅니다 (한국어 ${ko.length}개, 영어 ${en.length}개)`)
  }
  en.forEach((item, index) => {
    if (item.type !== ko[index].type) {
      throw new Error(
        `content/${file}: ${index + 1}번째 항목의 type이 timeline.json과 다릅니다 (한국어 ${ko[index].type}, 영어 ${item.type}) — 같은 순서로 적어 주세요`
      )
    }
  })
  return en
})
