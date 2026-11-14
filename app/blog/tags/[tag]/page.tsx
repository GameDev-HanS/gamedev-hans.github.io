import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/container"
import { PostList } from "@/components/sections/post-list"
import { PageHeader } from "@/components/shared/page-header"
import { TagFilter } from "@/components/shared/tag-list"
import { pageMetadata } from "@/lib/metadata"
import { getAllPosts, getAllTags, getPostsByTag } from "@/lib/posts"

// 빌드 시 글에 쓰인 태그마다 정적 페이지를 만들고, 그 밖의 주소는 404(GAME OVER)
export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.slug }))
}

export const dynamicParams = false

/** 주소의 태그 slug에 해당하는 태그(표시 이름·글 수). 글에 쓰이지 않은 태그면 undefined */
function findTag(slug: string) {
  return getAllTags().find((tag) => tag.slug === slug)
}

const describe = (label: string, count: number) => `'${label}' 태그 글 ${count}개`

// 브라우저 탭 제목 = #표시 이름
export async function generateMetadata({ params }: PageProps<"/blog/tags/[tag]">): Promise<Metadata> {
  const tag = findTag((await params).tag)
  if (!tag) return {}
  return pageMetadata({
    title: `#${tag.label}`,
    description: describe(tag.label, tag.count),
    path: `/blog/tags/${tag.slug}`,
  })
}

// 태그별 글 목록: /blog와 같은 구성(제목 → 태그 선택 → 글 카드)이고, 태그 선택에서 이 태그가 강조됩니다.
export default async function TagPage({ params }: PageProps<"/blog/tags/[tag]">) {
  const tag = findTag((await params).tag)
  if (!tag) notFound()

  return (
    <Container className="flex flex-col gap-8 py-12">
      <PageHeader title={`#${tag.label}`} description={describe(tag.label, tag.count)} />
      <TagFilter tags={getAllTags()} total={getAllPosts().length} current={tag.slug} />
      <PostList posts={getPostsByTag(tag.slug)} />
    </Container>
  )
}
