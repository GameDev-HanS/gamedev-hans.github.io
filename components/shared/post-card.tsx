import Image from "next/image"
import Link from "next/link"
import { PlayIcon } from "lucide-react"

import { HoverCard } from "@/components/shared/motion/hover-card"
import { TagList } from "@/components/shared/tag-list"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { withBasePath } from "@/lib/base-path"
import { UI, localePath, type Locale } from "@/lib/i18n"
import type { Post } from "@/lib/posts"

// 썸네일 위 표시 칩 (영상·EN). 사진·그라데이션 어느 쪽 위에서도 보이게 반투명 검정 배경 + 흰 글자
const overlayChip =
  "inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"

// 블로그 글 카드. 카드 전체가 글 상세로 가는 링크이고, 마우스를 올리거나 키보드로 포커스하면 테두리가 포인트 색으로 바뀝니다.
// 마우스를 올리면 살짝 떠오르며 마우스를 따라 기울고, 누르면 살짝 작아집니다 (HoverCard).
// headingAs: 카드가 놓인 곳의 제목 단계에 맞춥니다 (페이지 h1 바로 아래면 h2, 섹션 h2 아래면 h3).
// locale "en"이면 영어판 글(/en/blog/<slug>)로 연결하고, 한국어 카드는 번역본이 있을 때 "EN" 칩을 붙입니다 (v1.1.0).
export function PostCard({
  post,
  headingAs: Heading = "h2",
  locale = "ko",
}: {
  post: Post
  headingAs?: "h2" | "h3"
  locale?: Locale
}) {
  const t = UI[locale]
  const showEnglish = locale === "ko" && post.hasEnglish
  return (
    // 링크는 제자리에 두고(클릭·포커스 영역) 안쪽 HoverCard만 움직입니다. 테두리는 움직이는 쪽에 둡니다.
    <Link href={localePath(locale, `/blog/${post.slug}`)} className="group block h-full">
      <HoverCard className="border border-transparent accent-hover-in-group">
        <Card className="h-full gap-3 pt-0">
          <div className="relative aspect-video overflow-hidden">
            {post.thumbnail ? (
              // 카드 링크 이름에 제목이 이미 있으므로 썸네일은 장식 이미지로 처리 (화면 낭독기가 제목을 두 번 읽지 않게)
              <Image
                src={withBasePath(post.thumbnail)}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              // 대표 이미지가 없는 글: 옅은 포인트 색 그라데이션 자리 표시 (장식용)
              <div
                aria-hidden
                className="size-full bg-linear-to-br from-primary/15 via-card to-card"
              />
            )}
            {/* 썸네일 왼쪽 위 표시: 본문에 영상이 있으면 "영상", 영어 번역본이 있으면 "EN".
                글자가 있어 화면 낭독기도 카드 링크 이름에 함께 읽습니다 (EN은 sr-only로 "영어판 있음") */}
            {(post.hasVideo || showEnglish) && (
              <div className="absolute top-2 left-2 flex gap-1.5">
                {post.hasVideo && (
                  <span className={overlayChip}>
                    <PlayIcon aria-hidden className="size-3 fill-current" />
                    {t.video}
                  </span>
                )}
                {showEnglish && (
                  <span className={cn(overlayChip, "font-mono")}>
                    <span aria-hidden>{t.english}</span>
                    <span className="sr-only">{t.englishLabel}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 px-(--card-spacing)">
            <time dateTime={post.date} className="font-mono text-xs text-muted-foreground">
              {post.date}
            </time>
            <Heading className="font-heading text-base font-semibold transition-colors group-hover:text-primary">
              {post.title}
            </Heading>
            <p className="line-clamp-2 text-sm text-muted-foreground">{post.summary}</p>
            {/* 태그 칩: 카드 전체가 글 상세 링크라 링크 없이 표시만 (태그 이동은 /blog 상단 칩·글 상세 칩) */}
            <div className="mt-auto pt-2">
              <TagList tags={post.tags} locale={locale} />
            </div>
          </div>
        </Card>
      </HoverCard>
    </Link>
  )
}
