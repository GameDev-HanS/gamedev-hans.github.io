import Image from "next/image"

import { Badge } from "@/components/ui/badge"
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
      {/* 태그 칩: 태그별 페이지 링크는 T-307에서 연결 */}
      <ul className="flex flex-wrap gap-1.5 font-mono" aria-label="태그">
        {post.tags.map((tag) => (
          <li key={tag}>
            <Badge variant="outline">#{tag}</Badge>
          </li>
        ))}
      </ul>
      {post.thumbnail && (
        <div className="relative mt-2 aspect-video overflow-hidden ring-1 ring-foreground/10">
          <Image
            src={post.thumbnail}
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
