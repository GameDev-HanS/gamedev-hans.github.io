import Link from "next/link"
import { BoxIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { BgmToggle } from "@/components/shared/bgm-toggle"
import { Stagger, StaggerItem } from "@/components/shared/motion/stagger"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { siteConfig } from "@/config/site"

// 헤더: 첫 접속·새로고침 때 모바일 메뉴 버튼 → 로고 → 메뉴 항목 → 음악·테마 버튼이 차례로 나타납니다.
// 레이아웃에 있어 사이트 안에서 이동할 때는 다시 재생되지 않습니다.
const HEADER_GAP = 0.05

export function SiteHeader() {
  return (
    // viewTransitionName: 페이지 전환(T-122) 중에도 헤더는 그대로 두기 위한 이름 (globals.css)
    <header
      className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60"
      style={{ viewTransitionName: "site-header" }}
    >
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
            <BgmToggle />
            <ThemeToggle />
          </StaggerItem>
        </Stagger>
      </Container>
    </header>
  )
}
