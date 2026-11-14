import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Stagger, StaggerItem } from "@/components/shared/motion/stagger"
import { Section } from "@/components/shared/section"
import { PostCard } from "@/components/shared/post-card"
import { UI, localePath, type Locale } from "@/lib/i18n"
import type { Post } from "@/lib/posts"

// 홈의 최근 글 (최대 3개). 히어로 다음에 차례로 나타나고, 전체 글이 더 있으면 하단에 "전체 글 보기" 링크를 보여 줍니다.
// locale "en"이면 영어판 글(번역본이 있는 글)을 받아 /en/blog로 연결합니다.
export function RecentPosts({ posts, total, locale = "ko" }: { posts: Post[]; total: number; locale?: Locale }) {
  if (posts.length === 0) return null
  const t = UI[locale]

  return (
    <Section title={t.recentPosts}>
      <Stagger as="ul" delay={0.5} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <StaggerItem as="li" key={post.slug}>
            <PostCard post={post} headingAs="h3" locale={locale} />
          </StaggerItem>
        ))}
      </Stagger>
      {total > posts.length && (
        <Link
          href={localePath(locale, "/blog")}
          className="link-hover mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          {t.allPostsCount(total)}
          <ArrowRightIcon className="size-4" />
        </Link>
      )}
    </Section>
  )
}
