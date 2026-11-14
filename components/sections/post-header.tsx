import Image from "next/image"
import Link from "next/link"
import { LanguagesIcon } from "lucide-react"

import { TagList } from "@/components/shared/tag-list"
import { withBasePath } from "@/lib/base-path"
import { localePath, type Locale } from "@/lib/i18n"
import type { Post } from "@/lib/posts"

// 다른 언어판 링크 문구. 읽을 사람이 그 언어 사용자라서 링크 글자는 상대 언어로 적습니다.
const OTHER_LANGUAGE = {
  ko: { locale: "en", label: "Read in English" },
  en: { locale: "ko", label: "한국어로 읽기" },
} as const satisfies Record<Locale, { locale: Locale; label: string }>

// 글 상세 상단: 작성일, 제목, 태그, (다른 언어판이 있으면) 언어 링크, 대표 이미지
// locale "en": 영어판 글. 태그 페이지가 영어판에 없어 태그 칩은 링크 없이 보여 줍니다 (v1.1.0)
export function PostHeader({
  post,
  locale = "ko",
  hasOtherLanguage = false,
}: {
  post: Post
  locale?: Locale
  /** 다른 언어판이 있는지 (한국어 글이면 번역본, 영어 글이면 항상 원문이 있음) */
  hasOtherLanguage?: boolean
}) {
  const other = OTHER_LANGUAGE[locale]
  return (
    <header className="flex flex-col gap-4 border-b pb-8">
      <time dateTime={post.date} className="font-mono text-xs text-muted-foreground">
        {post.date}
      </time>
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="text-sm text-muted-foreground">{post.summary}</p>
      {/* 태그 칩: 한국어 글은 누르면 태그별 글 목록(/blog/tags/<slug>)으로 */}
      <TagList tags={post.tags} linked={locale === "ko"} locale={locale} />
      {hasOtherLanguage && (
        <Link
          href={localePath(other.locale, `/blog/${post.slug}`)}
          hrefLang={other.locale}
          lang={other.locale}
          className="link-hover inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground"
        >
          <LanguagesIcon aria-hidden className="size-4" />
          {other.label}
        </Link>
      )}
      {post.thumbnail && (
        <div className="relative mt-2 aspect-video overflow-hidden ring-1 ring-foreground/10">
          <Image
            src={withBasePath(post.thumbnail)}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      )}
    </header>
  )
}
