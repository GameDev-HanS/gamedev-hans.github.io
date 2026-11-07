import Link from "next/link"

import { Container } from "@/components/layout/container"
import { siteConfig } from "@/config/site"

export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <Container className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Built with Next.js &
          shadcn/ui.
        </p>
        <nav className="flex gap-4">
          {siteConfig.mainNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.title}
            </Link>
          ))}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </Container>
    </footer>
  )
}
