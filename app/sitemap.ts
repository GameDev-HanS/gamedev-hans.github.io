import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

// 정적 내보내기(output: 'export')에서는 빌드 시 파일로 생성되도록 명시
export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return siteConfig.mainNav.map((item) => ({
    url: `${siteConfig.url}${item.href === "/" ? "" : item.href}`,
    lastModified: new Date(),
  }))
}
