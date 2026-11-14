import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { PostHeader } from "@/components/sections/post-header"
import { PostNav } from "@/components/sections/post-nav"
import { PostProse } from "@/components/shared/post-prose"
import { buttonVariants } from "@/components/ui/button"
import { pageMetadata } from "@/lib/metadata"
import { getAdjacentPosts, getAllPosts, getPostBySlug } from "@/lib/posts"
import { cn } from "@/lib/utils"

// 빌드 시 글마다 정적 페이지를 만들고, 그 밖의 주소는 404(GAME OVER)
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export const dynamicParams = false

// 브라우저 탭 제목 = 글 제목, 검색 설명 = 요약, 공유 미리보기는 글(article) 정보 + 대표 이미지(있을 때만)
export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
    // 영어 번역본이 있으면 hreflang으로 연결
    ...(post.hasEnglish && { languages: { ko: `/blog/${post.slug}`, en: `/en/blog/${post.slug}` } }),
    openGraph: {
      type: "article",
      publishedTime: `${post.date}T00:00:00Z`,
      tags: post.tags.map((tag) => tag.label),
      ...(post.thumbnail && { images: [post.thumbnail] }),
    },
  })
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { default: Body } = await import(`@/content/posts/${slug}.mdx`)

  return (
    <Container className="max-w-3xl py-12">
      <article className="flex flex-col gap-10">
        <PostHeader post={post} hasOtherLanguage={post.hasEnglish} />
        <PostProse>
          <Body />
        </PostProse>
      </article>
      <div className="mt-12 flex flex-col items-start gap-8 border-t pt-8">
        <PostNav {...getAdjacentPosts(slug)} />
        <Link href="/blog" className={cn(buttonVariants({ variant: "outline" }), "accent-hover")}>
          <ArrowLeftIcon data-icon="inline-start" />
          목록으로
        </Link>
      </div>
    </Container>
  )
}
