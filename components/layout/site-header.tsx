import Link from "next/link"
import { BoxIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { BgmToggle } from "@/components/shared/bgm-toggle"
import { LanguageToggle } from "@/components/shared/language-toggle"
import { Stagger, StaggerItem } from "@/components/shared/motion/stagger"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { siteConfig } from "@/config/site"

// 헤더: 첫 접속·새로고침 때 모바일 메뉴 버튼 → 로고 → 메뉴 항목 → 음악·테마 버튼이 차례로 나타납니다.
// 레이아웃에 있어 사이트 안에서 이동할 때는 다시 재생되지 않습니다.
const HEADER_GAP = 0.05

// englishSlugs: 번역본이 있는 글 slug (KR/EN 전환 버튼이 짝 페이지를 고를 때 씀, v1.1.0)
export function SiteHeader({ englishSlugs }: { englishSlugs: readonly string[] }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Container>
        <Stagger gap={HEADER_GAP} className="flex h-14 items-center gap-2">
          <StaggerItem className="md:hidden">
            <MobileNav />
          </StaggerItem>
          <StaggerItem>
            <Link href="/" className="mr-4 flex items-center gap-2 font-mono text-sm font-semibold">
              <BoxIcon className="size-5 text-primary" />
              {siteConfig.name}
            </Link>
          </StaggerItem>
          <MainNav />
          <StaggerItem className="ml-auto flex items-center gap-1">
            <LanguageToggle englishSlugs={englishSlugs} />
            <BgmToggle />
            <ThemeToggle />
          </StaggerItem>
        </Stagger>
      </Container>
    </header>
  )
}
