import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Section } from "@/components/shared/section"
import { PostCard } from "@/components/shared/post-card"
import type { Post } from "@/lib/posts"

// 홈의 최근 글 (최대 3개). 전체 글이 더 있으면 하단에 "전체 글 보기" 링크를 보여 줍니다.
export function RecentPosts({ posts, total }: { posts: Post[]; total: number }) {
  if (posts.length === 0) return null

  return (
    <Section title="최근 글">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
      {total > posts.length && (
        <Link
          href="/blog"
          className="mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-neon-cyan"
        >
          전체 글 보기 ({total}개)
          <ArrowRightIcon className="size-4" />
        </Link>
      )}
    </Section>
  )
}
