// 언어(한국어 기본 + 영어) 화면 문구 사전 (v1.1.0). 한국어 페이지는 지금 주소 그대로, 영어 페이지는 /en 아래에 있습니다.
// 문구가 수십 개뿐이고 라우팅도 /en 폴더로 직접 나누므로 i18n 라이브러리 없이 객체 하나로 둡니다.
// 클라이언트 컴포넌트(헤더 언어 전환·메뉴)에서도 import하므로 서버 전용 코드(fs 등)는 넣지 않습니다.
import { siteConfig } from "@/config/site"

export const LOCALES = ["ko", "en"] as const
export type Locale = (typeof LOCALES)[number]

/** 영어 페이지 주소 앞부분 */
export const EN_PREFIX = "/en"

/** 언어에 맞는 사이트 안 주소. ko는 그대로, en은 앞에 /en을 붙입니다 ("/" → "/en"). */
export function localePath(locale: Locale, href: string): string {
  if (locale === "ko") return href
  return href === "/" ? EN_PREFIX : `${EN_PREFIX}${href}`
}

/** 주소가 영어 페이지(/en, /en/...)인지 */
export function isEnglishPath(pathname: string): boolean {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`)
}

export const UI = {
  ko: {
    siteDescription: siteConfig.description,
    allPosts: "전체 글 보기",
    allPostsCount: (n: number) => `전체 글 보기 (${n}개)`,
    interests: "관심 분야",
    studying: "지금 공부 중",
    skillStack: "기술 스택",
    skillCategory: { language: "언어", engine: "게임 엔진", os: "운영체제", ide: "IDE", etc: "기타" },
    careerTitle: "경력·학력",
    timelineType: { work: "경력", education: "교육", certificate: "자격증" },
    certificates: "자격증",
    recentPosts: "최근 글",
    noPosts: "아직 글이 없습니다.",
    video: "영상",
    english: "EN",
    englishLabel: "영어판 있음",
    tags: "태그",
    prevNextNav: "이전·다음 글",
    prevPost: "이전 글",
    nextPost: "다음 글",
    backToList: "목록으로",
    blogTitle: "블로그",
    blogDescription: "게임 개발 공부와 개발 과정, 일상 기록",
  },
  en: {
    siteDescription: "Notes on game development and my everyday life",
    allPosts: "View all posts",
    allPostsCount: (n: number) => `View all posts (${n})`,
    interests: "Interests",
    studying: "Currently studying",
    skillStack: "Tech Stack",
    skillCategory: { language: "Languages", engine: "Game Engines", os: "OS", ide: "IDEs", etc: "Other" },
    careerTitle: "Experience & Education",
    timelineType: { work: "Work", education: "Education", certificate: "Certificate" },
    certificates: "Certificates",
    recentPosts: "Recent Posts",
    noPosts: "No posts yet.",
    video: "Video",
    english: "EN",
    englishLabel: "English available",
    tags: "Tags",
    prevNextNav: "Previous and next posts",
    prevPost: "Previous",
    nextPost: "Next",
    backToList: "Back to list",
    blogTitle: "Blog",
    blogDescription: "Game development study notes, devlogs, and everyday life (English translations)",
  },
} as const satisfies Record<Locale, unknown>
