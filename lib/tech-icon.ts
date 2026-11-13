// 서버 전용: simple-icons 전체를 읽으므로 클라이언트 번들에 들어가지 않게 막습니다
import "server-only"

import * as simpleIcons from "simple-icons"

/**
 * 배지 아이콘 색 처리
 * - normal: 두 모드 모두 브랜드 색
 * - dark: 브랜드 색이 거의 검정 → 다크 모드에서는 글자색 (예: Unreal Engine, Rider, GitHub)
 * - light: 브랜드 색이 아주 밝음 → 라이트 모드에서는 글자색 (예: Unity, C)
 */
export type TechIconTone = "normal" | "dark" | "light"

export type TechIcon = { path: string; hex: string; tone: TechIconTone }

const ICONS = new Map(
  Object.values(simpleIcons)
    .filter((icon) => typeof icon === "object" && icon !== null && "slug" in icon)
    .map((icon) => [icon.slug, icon])
)

/** sRGB 상대 휘도 (0 = 검정, 1 = 흰색, WCAG 정의) */
function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** simple-icons 이름(slug) → 아이콘 경로·브랜드 색. 없으면 null (로더가 이미 없는 이름을 막음) */
export function getTechIcon(slug: string | undefined): TechIcon | null {
  const icon = slug ? ICONS.get(slug) : undefined
  if (!icon) return null
  const lum = luminance(icon.hex)
  // 0.4 초과는 라이트 모드 흰 배경에서 흐림 (예: C #A8B9CC 약 0.47, Unity #FFFFFF)
  const tone: TechIconTone = lum < 0.05 ? "dark" : lum > 0.4 ? "light" : "normal"
  return { path: icon.path, hex: icon.hex, tone }
}
