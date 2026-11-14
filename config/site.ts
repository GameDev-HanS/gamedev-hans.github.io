// 사이트 전역 정보. 이름, 메뉴 등은 여기서만 수정하세요.
export const siteConfig = {
  name: "HanS Dev Log",
  description: "게임 개발과 나의 일상 기록",
  url: "https://gamedev-hans.github.io",
  // 헤더·푸터·모바일 메뉴·sitemap이 모두 이 목록을 씁니다.
  // titleEn: 영어 페이지(/en 아래)에서 보일 이름. hasEnglish: 영어판 페이지(/en<href>)가 있는지 —
  // 없으면 영어 페이지에서도 한국어 페이지로 연결합니다 (v1.1.0)
  mainNav: [
    { title: "홈", titleEn: "Home", href: "/", hasEnglish: true },
    { title: "블로그", titleEn: "Blog", href: "/blog", hasEnglish: true },
    { title: "게임", titleEn: "Games", href: "/games", hasEnglish: true },
  ],
  // 푸터 외부 링크는 content/profile.json의 links에 있습니다 (T-207)
} as const

export type NavItem = (typeof siteConfig.mainNav)[number]
