"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { isEnglishPath, localePath } from "@/lib/i18n"

// 헤더 로고 링크 (v1.1.1). 영어 페이지(/en 아래)에서는 영어 홈(/en), 그 밖에서는 한국어 홈(/)으로 갑니다.
// 헤더(SiteHeader)는 서버 컴포넌트라 주소를 모르므로, 주소를 보는 이 부분만 클라이언트 컴포넌트로 둡니다.
export function HomeLink({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = usePathname()
  return (
    <Link href={localePath(isEnglishPath(pathname) ? "en" : "ko", "/")} className={className}>
      {children}
    </Link>
  )
}
