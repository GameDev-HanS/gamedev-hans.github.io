import Link from "next/link"

import { Container } from "@/components/layout/container"
import { siteConfig } from "@/config/site"

// 홈은 로고로 갈 수 있으므로 푸터에서는 뺍니다
const footerNav = siteConfig.mainNav.filter((item) => item.href !== "/")

export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <Container className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <nav className="flex gap-4">
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-neon-cyan"
            >
              {item.title}
            </Link>
          ))}
          {siteConfig.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-neon-cyan"
            >
              {link.title}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  )
}
