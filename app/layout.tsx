import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BgmProvider } from "@/components/providers/bgm-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PageTransition } from "@/components/shared/page-transition";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { getBackgroundMusic } from "@/lib/music";
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
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // 배경 음악: 음원이 없으면 null → 헤더 버튼·푸터 출처·<audio>를 모두 숨김
  const music = getBackgroundMusic();

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
                <SiteHeader />
                <main className="flex flex-1 flex-col">
                  <PageTransition>{children}</PageTransition>
                </main>
                <SiteFooter music={music} />
                <Toaster />
              </TooltipProvider>
            </BgmProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
