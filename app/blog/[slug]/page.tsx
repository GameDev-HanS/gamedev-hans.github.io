import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { PostHeader } from "@/components/sections/post-header"
import { PostNav } from "@/components/sections/post-nav"
import { buttonVariants } from "@/components/ui/button"
import { getAdjacentPosts, getAllPosts, getPostBySlug } from "@/lib/posts"
import { cn } from "@/lib/utils"

// 빌드 시 글마다 정적 페이지를 만들고, 그 밖의 주소는 404(GAME OVER)
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export const dynamicParams = false

// 브라우저 탭 제목 = 글 제목, 검색 설명 = 요약
export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.summary }
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { default: Body } = await import(`@/content/posts/${slug}.mdx`)

  return (
    <Container className="max-w-3xl py-12">
      <article className="flex flex-col gap-10">
        <PostHeader post={post} />
        {/* 본문 서식: @tailwindcss/typography의 prose + 포인트 색(시안) 링크 */}
        <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-4 prose-blockquote:border-primary prose-blockquote:not-italic prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-img:mx-auto">
          <Body />
        </div>
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
