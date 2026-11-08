import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Post } from "@/lib/posts"

// 블로그 글 카드. 카드 전체가 글 상세로 가는 링크이고, 마우스를 올리거나 키보드로 포커스하면 네온 테두리가 켜집니다.
export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full border border-transparent neon-hover"
    >
      <Card className="h-full gap-3 pt-0">
        <div className="relative aspect-video overflow-hidden">
          {post.thumbnail ? (
            // 카드 링크 이름에 제목이 이미 있으므로 썸네일은 장식 이미지로 처리 (화면 낭독기가 제목을 두 번 읽지 않게)
            <Image
              src={post.thumbnail}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            // 대표 이미지가 없는 글: 네온 그라데이션 자리 표시 (장식용)
            <div
              aria-hidden
              className="size-full bg-linear-to-br from-neon-cyan/40 via-background to-neon-magenta/40"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 px-(--card-spacing)">
          <time dateTime={post.date} className="text-xs text-muted-foreground">
            {post.date}
          </time>
          <h2 className="font-heading text-base font-semibold transition-colors group-hover:text-neon-cyan">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.summary}</p>
          {/* 태그 칩: 태그별 페이지 링크는 T-307에서 연결 */}
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="태그">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline">#{tag}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </Link>
  )
}
