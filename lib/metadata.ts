import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

type OpenGraph = NonNullable<Metadata["openGraph"]>

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
}

/** 페이지 메타데이터: title·description + 자기 자신 canonical + 같은 내용의 OG 정보 */
export function pageMetadata({ title, description, path, openGraph }: PageMetadataOptions): Metadata {
  return {
    ...(title && { title }),
    ...(description && { description }),
    alternates: { canonical: path },
    openGraph: {
      ...baseOpenGraph,
      title: title ?? siteConfig.name,
      description: description ?? siteConfig.description,
      url: path,
      ...openGraph,
    },
  }
}
