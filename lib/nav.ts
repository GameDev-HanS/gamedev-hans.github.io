import { siteConfig } from "@/config/site"
import { isEnglishPath, localePath } from "@/lib/i18n"

// 현재 주소가 메뉴 항목에 해당하는지 판단합니다 (데스크톱·모바일 메뉴 공용).
// "/"·"/en"(홈)은 정확히 같을 때만, 나머지는 하위 경로까지 포함합니다 (예: /games/2026 → "게임").
export function isNavActive(pathname: string, href: string) {
  if (href === "/" || href === "/en") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * 지금 주소의 언어에 맞춘 메뉴 (v1.1.0). 영어 페이지(/en 아래)면 영어 이름과 /en 주소를 쓰고,
 * 영어판이 없는 항목(게임)은 이름만 영어이고 한국어 페이지로 연결합니다.
 */
export function getNavItems(pathname: string): { title: string; href: string }[] {
  const english = isEnglishPath(pathname)
  return siteConfig.mainNav.map((item) => ({
    title: english ? item.titleEn : item.title,
    href: english && item.hasEnglish ? localePath("en", item.href) : item.href,
  }))
}
