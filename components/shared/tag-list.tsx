import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import type { Tag } from "@/lib/posts"
import { cn } from "@/lib/utils"

const tagHref = (slug: string) => `/blog/tags/${slug}`

// 글 하나의 태그 칩 (#표시 이름). linked면 칩을 누르면 태그별 글 목록으로 갑니다.
// 글 카드는 카드 전체가 글 상세 링크라 링크 안 링크가 되지 않도록 linked 없이 표시만 합니다.
export function TagList({ tags, linked = false }: { tags: Tag[]; linked?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5 font-mono" aria-label="태그">
      {tags.map((tag) => (
        <li key={tag.slug}>
          {linked ? (
            <Badge
              variant="outline"
              // 누르기 쉽게 높이를 28px 이상으로 (Badge 기본 h-5는 min-height가 덮어씀)
              className="min-h-7 accent-hover press"
              render={<Link href={tagHref(tag.slug)} />}
            >
              #{tag.label}
            </Badge>
          ) : (
            <Badge variant="outline">#{tag.label}</Badge>
          )}
        </li>
      ))}
    </ul>
  )
}

// 블로그 태그 선택: '전체 n'(/blog) + 태그별 '#이름 n'(/blog/tags/<slug>).
// current는 지금 보고 있는 보기("all" 또는 태그 slug)이고, 그 칩은 포인트 색 테두리·글자로 강조합니다.
// 태그 slug로 "all"은 쓸 수 없게 lib/posts.ts에서 막아 '전체'와 겹치지 않습니다.
export function TagFilter({
  tags,
  total,
  current,
}: {
  tags: (Tag & { count: number })[]
  total: number
  current: "all" | string
}) {
  const items = [
    { key: "all", label: "전체", count: total, href: "/blog" },
    ...tags.map((tag) => ({ key: tag.slug, label: `#${tag.label}`, count: tag.count, href: tagHref(tag.slug) })),
  ]

  return (
    <nav aria-label="태그 선택">
      <ul className="flex flex-wrap gap-2 font-mono text-sm">
        {items.map((item) => {
          const active = item.key === current
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 border px-3 py-1",
                  active ? "border-primary text-primary" : "accent-hover press text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                <span className="text-xs opacity-70">{item.count}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
