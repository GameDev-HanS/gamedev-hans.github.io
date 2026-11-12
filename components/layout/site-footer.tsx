import { Container } from "@/components/layout/container"
import { MusicCredit } from "@/components/shared/music-credit"
import { siteConfig } from "@/config/site"
import type { BackgroundMusic } from "@/lib/music"

// 사이트 안 메뉴는 헤더에 있으므로 푸터에는 저작권 표시와 외부 링크(GitHub 등)만 둡니다
export function SiteFooter({ music }: { music: BackgroundMusic | null }) {
  return (
    // viewTransitionName: 페이지 전환(T-122) 중에도 푸터는 그대로 두기 위한 이름 (globals.css)
    <footer className="border-t py-6" style={{ viewTransitionName: "site-footer" }}>
      <Container className="flex flex-col gap-3 text-xs text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          {siteConfig.links.length > 0 && (
            <nav aria-label="외부 링크" className="flex gap-4">
              {siteConfig.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-hover"
                >
                  {link.title}
                </a>
              ))}
            </nav>
          )}
        </div>
        <MusicCredit music={music} />
      </Container>
    </footer>
  )
}
