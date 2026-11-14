import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BgmProvider } from "@/components/providers/bgm-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/base-path";
import { getProfile } from "@/lib/content";
import { baseOpenGraph } from "@/lib/metadata";
import { getBackgroundMusic } from "@/lib/music";
import { getAllEnglishPosts } from "@/lib/posts";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // basePath 포함 주소: 페이지의 canonical·og:url·og:image 상대 경로가 이 주소 뒤에 이어 붙습니다
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    ...baseOpenGraph,
    url: siteUrl,
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // 배경 음악: 음원이 없으면 null → 헤더 버튼·푸터 출처·<audio>를 모두 숨김
  const music = getBackgroundMusic();
  // 푸터 외부 링크 (content/profile.json, T-207)
  const { links } = getProfile();
  // 영어 번역본이 있는 글 (헤더 KR/EN 전환이 짝 페이지를 고를 때 씀, v1.1.0)
  const englishSlugs = getAllEnglishPosts().map((post) => post.slug);

  return (
    // suppressHydrationWarning: next-themes가 렌더 전에 <html> class를 바꾸기 때문에 필요
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", geistSans.variable, jetbrainsMono.variable)}
    >
      <head>
        {/* JS가 꺼진 브라우저: 애니메이션 시작 상태(투명·아래로 이동)를 풀어 내용이 바로 보이게 함 */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: "<style>[data-motion]{opacity:1!important;transform:none!important}</style>",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            <BgmProvider src={music?.src ?? null}>
              <TooltipProvider>
                <SiteHeader englishSlugs={englishSlugs} />
                {/* 페이지 전환 애니메이션 없음: 이동 때 이전 화면이 잠깐 남아 보여서 2026-11-14에 제거 */}
                <main className="flex flex-1 flex-col">{children}</main>
                <SiteFooter links={links} music={music} />
                <Toaster />
              </TooltipProvider>
            </BgmProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
