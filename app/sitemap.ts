import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { getAllPosts } from "@/lib/posts"

// 정적 내보내기(output: 'export')에서는 빌드 시 파일로 생성되도록 명시
export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  // 메뉴에 있는 페이지
  const pages = siteConfig.mainNav.map((item) => ({
    url: `${siteConfig.url}${item.href === "/" ? "" : item.href}`,
    lastModified: new Date(),
  }))
  // 블로그 글 (수정일 대신 작성일 사용)
  const posts = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
  }))
  return [...pages, ...posts]
}
