// 사이트 전역 정보. 이름, 메뉴 등은 여기서만 수정하세요.
export const siteConfig = {
  name: "HanS Dev Log",
  description: "게임 개발과 나의 일상 기록",
  url: "https://gamedev-hans.github.io",
  // /blog, /games는 해당 페이지 작업 전까지 404
  mainNav: [
    { title: "홈", href: "/" },
    { title: "블로그", href: "/blog" },
    { title: "게임", href: "/games" },
    { title: "소개", href: "/about" },
  ],
  links: {
    github: "https://github.com/GameDev-HanS/gamedev-hans.github.io",
  },
} as const

export type NavItem = (typeof siteConfig.mainNav)[number]
