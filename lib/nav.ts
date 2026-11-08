// 현재 주소가 메뉴 항목에 해당하는지 판단합니다 (데스크톱·모바일 메뉴 공용).
// "/"는 정확히 같을 때만, 나머지는 하위 경로까지 포함합니다 (예: /games/2026 → "게임").
export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
