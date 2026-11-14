import Image from "next/image"

import { TagList } from "@/components/shared/tag-list"
import { withBasePath } from "@/lib/base-path"
import type { Post } from "@/lib/posts"

// 글 상세 상단: 작성일, 제목, 태그, 대표 이미지
export function PostHeader({ post }: { post: Post }) {
  return (
    <header className="flex flex-col gap-4 border-b pb-8">
      <time dateTime={post.date} className="font-mono text-xs text-muted-foreground">
        {post.date}
      </time>
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="text-sm text-muted-foreground">{post.summary}</p>
      {/* 태그 칩: 누르면 태그별 글 목록(/blog/tags/<slug>)으로 */}
      <TagList tags={post.tags} linked />
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
