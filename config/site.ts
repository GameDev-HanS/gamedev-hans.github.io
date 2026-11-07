// 사이트 전역 정보. 이름, 메뉴 등은 여기서만 수정하세요.
export const siteConfig = {
  name: "Starter Kit",
  description:
    "Next.js, TypeScript, TailwindCSS, shadcn/ui로 만든 모던 웹 스타터킷",
  url: "https://gamedev-hans.github.io",
  mainNav: [
    { title: "홈", href: "/" },
    { title: "컴포넌트", href: "/components" },
    { title: "소개", href: "/about" },
  ],
  links: {
    github: "https://github.com/GameDev-HanS/gamedev-hans.github.io",
  },
} as const

export type NavItem = (typeof siteConfig.mainNav)[number]
