import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

// 정적 내보내기(output: 'export')에서는 빌드 시 파일로 생성되도록 명시
export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
