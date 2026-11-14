import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { UI, localePath, type Locale } from "@/lib/i18n"
import type { Post } from "@/lib/posts"
import { cn } from "@/lib/utils"

const cardClass = "flex flex-col gap-1 rounded-lg border bg-card p-4 accent-hover press"

// 글 상세 하단의 이전(더 오래된)·다음(더 최근) 글 링크. 둘 다 없으면(글이 하나뿐) 아무것도 그리지 않습니다.
// locale "en"이면 영어판 글끼리 연결합니다 (번역본이 있는 글만 받음).
export function PostNav({ prev, next, locale = "ko" }: { prev: Post | null; next: Post | null; locale?: Locale }) {
  if (!prev && !next) return null
  const t = UI[locale]

  return (
    <nav aria-label={t.prevNextNav} className="grid w-full gap-4 sm:grid-cols-2">
      {prev && (
        <Link href={localePath(locale, `/blog/${prev.slug}`)} className={cardClass}>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeftIcon className="size-3.5" aria-hidden />
            {t.prevPost}
          </span>
          <span className="line-clamp-2 font-medium">{prev.title}</span>
        </Link>
      )}
      {next && (
        // 이전 글이 없어도 다음 글은 오른쪽 칸에 둡니다
        <Link
          href={localePath(locale, `/blog/${next.slug}`)}
          className={cn(cardClass, "sm:col-start-2 sm:items-end sm:text-right")}
        >
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {t.nextPost}
            <ArrowRightIcon className="size-3.5" aria-hidden />
          </span>
          <span className="line-clamp-2 font-medium">{next.title}</span>
        </Link>
      )}
    </nav>
  )
}
