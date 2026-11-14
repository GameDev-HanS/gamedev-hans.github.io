import type { Metadata } from "next"

import { siteConfig } from "@/config/site"
import type { Locale } from "@/lib/i18n"

type OpenGraph = NonNullable<Metadata["openGraph"]>

const OG_LOCALE: Record<Locale, string> = { ko: "ko_KR", en: "en_US" }

// 모든 페이지 공통 OG 값. 페이지가 openGraph를 정하면 레이아웃의 openGraph는 통째로 대체되므로
// (Next.js 메타데이터는 얕은 병합) 페이지마다 이 값을 다시 넣습니다.
export const baseOpenGraph = {
  type: "website",
  locale: "ko_KR",
  siteName: siteConfig.name,
} satisfies OpenGraph

type PageMetadataOptions = {
  /** 탭 제목 (레이아웃 템플릿 "%s | 사이트 이름" 적용). 없으면 사이트 이름 */
  title?: string
  /** 검색·공유 설명. 없으면 사이트 설명 */
  description?: string
  /** 이 페이지 주소 (예: "/blog/hello-world"). metadataBase로 절대 주소가 되어 canonical·og:url에 쓰임 */
  path: string
  /** 페이지별로 덧붙이거나 바꿀 OG 값 (예: 글은 type "article") */
  openGraph?: OpenGraph
  /** 이 페이지의 언어 (영어 페이지면 "en" → og:locale en_US) */
  locale?: Locale
  /** 한국어·영어판이 모두 있는 페이지의 언어별 주소 (hreflang). 예: { ko: "/blog/x", en: "/en/blog/x" } */
  languages?: Record<Locale, string>
}

/** 페이지 메타데이터: title·description + 자기 자신 canonical + (있으면) 언어별 주소 + 같은 내용의 OG 정보 */
export function pageMetadata({
  title,
  description,
  path,
  openGraph,
  locale = "ko",
  languages,
}: PageMetadataOptions): Metadata {
  return {
    ...(title && { title }),
    ...(description && { description }),
    alternates: {
      canonical: path,
      // 기본 언어(한국어) 주소를 x-default로: 언어를 정하지 못한 검색 사용자는 원문으로
      ...(languages && { languages: { ...languages, "x-default": languages.ko } }),
    },
    openGraph: {
      ...baseOpenGraph,
      locale: OG_LOCALE[locale],
      ...(languages && { alternateLocale: OG_LOCALE[locale === "ko" ? "en" : "ko"] }),
      title: title ?? siteConfig.name,
      description: description ?? siteConfig.description,
      url: path,
      ...openGraph,
    },
  }
}
