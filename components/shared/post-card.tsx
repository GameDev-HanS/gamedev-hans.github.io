import Image from "next/image"
import Link from "next/link"

import { HoverCard } from "@/components/shared/motion/hover-card"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Post } from "@/lib/posts"

// 블로그 글 카드. 카드 전체가 글 상세로 가는 링크이고, 마우스를 올리거나 키보드로 포커스하면 테두리가 포인트 색으로 바뀝니다.
// 마우스를 올리면 살짝 떠오르며 마우스를 따라 기울고, 누르면 살짝 작아집니다 (HoverCard).
// headingAs: 카드가 놓인 곳의 제목 단계에 맞춥니다 (페이지 h1 바로 아래면 h2, 섹션 h2 아래면 h3).
export function PostCard({ post, headingAs: Heading = "h2" }: { post: Post; headingAs?: "h2" | "h3" }) {
  return (
    // 링크는 제자리에 두고(클릭·포커스 영역) 안쪽 HoverCard만 움직입니다. 테두리는 움직이는 쪽에 둡니다.
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <HoverCard className="border border-transparent accent-hover-in-group">
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
              // 대표 이미지가 없는 글: 옅은 포인트 색 그라데이션 자리 표시 (장식용)
              <div
                aria-hidden
                className="size-full bg-linear-to-br from-primary/15 via-card to-card"
              />
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
            {/* 태그 칩: 태그별 페이지 링크는 T-307에서 연결 */}
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-2 font-mono" aria-label="태그">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline">#{tag}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </HoverCard>
    </Link>
  )
}
