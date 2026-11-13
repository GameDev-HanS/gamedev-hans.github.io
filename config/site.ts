// 사이트 전역 정보. 이름, 메뉴 등은 여기서만 수정하세요.
export const siteConfig = {
  name: "HanS Dev Log",
  description: "게임 개발과 나의 일상 기록",
  url: "https://gamedev-hans.github.io",
  // 헤더·푸터·모바일 메뉴·sitemap이 모두 이 목록을 씁니다.
  mainNav: [
    { title: "홈", href: "/" },
    { title: "블로그", href: "/blog" },
    { title: "게임", href: "/games" },
  ],
  // 푸터 외부 링크는 content/profile.json의 links에 있습니다 (T-207)
} as const

export type NavItem = (typeof siteConfig.mainNav)[number]
