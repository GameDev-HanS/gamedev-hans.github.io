import Link from "next/link"
import { BoxIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { BgmToggle } from "@/components/shared/bgm-toggle"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { siteConfig } from "@/config/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Container className="flex h-14 items-center gap-2">
        <MobileNav />
        <Link href="/" className="mr-4 flex items-center gap-2 font-mono text-sm font-semibold">
          <BoxIcon className="size-5 text-primary" />
          {siteConfig.name}
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center gap-1">
          <BgmToggle />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  )
}
