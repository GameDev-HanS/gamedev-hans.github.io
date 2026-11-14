import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { siteUrl } from "@/lib/base-path"
import { getGameYears, getGamesByYear } from "@/lib/games"
import { getAllPosts, getAllTags, getPostsByTag } from "@/lib/posts"

// 정적 내보내기(output: 'export')에서는 빌드 시 파일로 생성되도록 명시
export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  // 메뉴에 있는 페이지
  const pages = siteConfig.mainNav.map((item) => ({
    url: `${siteUrl}${item.href === "/" ? "" : item.href}`,
    lastModified: new Date(),
  }))
  // 블로그 글 (수정일 대신 작성일 사용)
  const posts = getAllPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
  }))
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
