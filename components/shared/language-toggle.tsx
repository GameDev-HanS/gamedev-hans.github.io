"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { EN_PREFIX, isEnglishPath } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/**
 * 지금 페이지의 다른 언어 짝 주소 (v1.1.0).
 * - 영어 페이지 → /en을 뗀 한국어 주소 (영어 페이지는 모두 한국어 원본이 있음)
 * - 한국어 → / ↔ /en, /blog ↔ /en/blog, 번역본이 있는 글 /blog/x ↔ /en/blog/x.
 *   번역본이 없는 글은 영어 글 목록, 영어판이 없는 페이지(게임·태그)는 영어 홈으로 갑니다.
 */
function counterpart(pathname: string, englishSlugs: readonly string[]): string {
  if (isEnglishPath(pathname)) return pathname.slice(EN_PREFIX.length) || "/"
  if (pathname === "/") return EN_PREFIX
  if (pathname === "/blog") return `${EN_PREFIX}/blog`
  const post = /^\/blog\/([^/]+)$/.exec(pathname)
  if (post) return englishSlugs.includes(post[1]) ? `${EN_PREFIX}${pathname}` : `${EN_PREFIX}/blog`
  return EN_PREFIX
}

// 헤더의 KR / EN 전환 버튼. 지금 언어의 반대 언어 이름을 보여 주고, 누르면 짝 페이지로 이동합니다.
// englishSlugs: 번역본이 있는 글 slug (레이아웃에서 빌드 때 계산해 넘김)
export function LanguageToggle({ englishSlugs }: { englishSlugs: readonly string[] }) {
  const pathname = usePathname()
  const english = isEnglishPath(pathname)
  const target = english ? "ko" : "en"

  return (
    <Link
      href={counterpart(pathname, englishSlugs)}
      hrefLang={target}
      aria-label={english ? "한국어로 보기" : "View in English"}
      lang={target}
      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "font-mono text-xs font-semibold")}
    >
      {english ? "KR" : "EN"}
    </Link>
  )
}
