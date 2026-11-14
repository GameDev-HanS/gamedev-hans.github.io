import { Container } from "@/components/layout/container"
import { MusicCredit } from "@/components/shared/music-credit"
import { siteConfig } from "@/config/site"
import type { Profile } from "@/lib/content"
import type { BackgroundMusic } from "@/lib/music"

// 사이트 안 메뉴는 헤더에 있으므로 푸터에는 저작권 표시와 외부 링크(GitHub 등)만 둡니다.
// 외부 링크는 content/profile.json의 links (T-207). 로더가 http/https만 허용해 이메일·전화 링크는 없습니다.
export function SiteFooter({ links, music }: { links: Profile["links"]; music: BackgroundMusic | null }) {
  return (
    <footer className="border-t py-6">
      <Container className="flex flex-col gap-3 text-xs text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          {links.length > 0 && (
            <nav aria-label="외부 링크" className="flex flex-wrap justify-center gap-4">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-hover"
                >
                  {link.label}
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
