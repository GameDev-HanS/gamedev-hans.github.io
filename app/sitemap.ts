import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { siteUrl } from "@/lib/base-path"
import { getGameYears, getGamesByYear } from "@/lib/games"
import { localePath } from "@/lib/i18n"
import { getAllPosts, getAllTags, getPostsByTag } from "@/lib/posts"

// 정적 내보내기(output: 'export')에서는 빌드 시 파일로 생성되도록 명시
export const dynamic = "force-static"

// 사이트 안 경로 → 절대 주소 ("/"는 끝 슬래시 없이)
const abs = (href: string) => `${siteUrl}${href === "/" ? "" : href}`

// 한국어·영어판이 모두 있는 페이지의 언어별 주소 (hreflang, v1.1.0)
const languages = (href: string) => ({ languages: { ko: abs(href), en: abs(localePath("en", href)) } })

export default function sitemap(): MetadataRoute.Sitemap {
  // 메뉴에 있는 페이지 (영어판이 있으면 영어 페이지도 함께 넣고 서로 연결)
  const pages = siteConfig.mainNav.flatMap((item) => {
    const ko = { url: abs(item.href), lastModified: new Date() }
    if (!item.hasEnglish) return [ko]
    const alternates = languages(item.href)
    return [
      { ...ko, alternates },
      { url: abs(localePath("en", item.href)), lastModified: new Date(), alternates },
    ]
  })
  // 블로그 글 (수정일 대신 작성일 사용). 번역본이 있으면 영어 글도 넣고 서로 연결
  const posts = getAllPosts().flatMap((post) => {
    const href = `/blog/${post.slug}`
    const ko = { url: abs(href), lastModified: new Date(`${post.date}T00:00:00Z`) }
    if (!post.hasEnglish) return [ko]
    const alternates = languages(href)
    return [
      { ...ko, alternates },
      { url: abs(localePath("en", href)), lastModified: ko.lastModified, alternates },
    ]
  })
  // 태그별 글 목록 (수정일 = 그 태그 글 중 가장 최근 작성일, 글 목록은 최신순)
  const tags = getAllTags().map((tag) => ({
    url: `${siteUrl}/blog/tags/${tag.slug}`,
    lastModified: new Date(`${getPostsByTag(tag.slug)[0].date}T00:00:00Z`),
  }))
  // 연도별 플레이 게임 페이지 (/games는 전체 보기라 메뉴 경로로 이미 포함)
  // 수정일 = 그해 게임의 가장 늦은 시작일·끝낸 날, 날짜가 없으면 생략
  const gameYears = getGameYears().map((year) => {
    const latest = (getGamesByYear(year) ?? [])
      .flatMap((game) => [game.startedAt, game.endedAt])
      .filter((date): date is string => Boolean(date))
      .sort()
      .at(-1)
    return {
      url: `${siteUrl}/games/${year}`,
      ...(latest && { lastModified: new Date(`${latest}T00:00:00Z`) }),
    }
  })
  return [...pages, ...posts, ...tags, ...gameYears]
}
