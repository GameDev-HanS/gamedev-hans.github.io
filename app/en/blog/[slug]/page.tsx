import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { PostHeader } from "@/components/sections/post-header"
import { PostNav } from "@/components/sections/post-nav"
import { PostProse } from "@/components/shared/post-prose"
import { buttonVariants } from "@/components/ui/button"
import { UI } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { getAdjacentEnglishPosts, getAllEnglishPosts, getEnglishPostBySlug } from "@/lib/posts"
import { cn } from "@/lib/utils"

// 영어 글 상세 (v1.1.0). 번역본(content/posts/en/<slug>.mdx)이 있는 글만 정적 페이지로 만들고, 그 밖은 404
export function generateStaticParams() {
  return getAllEnglishPosts().map((post) => ({ slug: post.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/en/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const post = getEnglishPostBySlug(slug)
  if (!post) return {}
  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/en/blog/${post.slug}`,
    locale: "en",
    languages: { ko: `/blog/${post.slug}`, en: `/en/blog/${post.slug}` },
    openGraph: {
      type: "article",
      publishedTime: `${post.date}T00:00:00Z`,
      tags: post.tags.map((tag) => tag.label),
      ...(post.thumbnail && { images: [post.thumbnail] }),
    },
  })
}

export default async function EnglishPostPage({ params }: PageProps<"/en/blog/[slug]">) {
  const { slug } = await params
  const post = getEnglishPostBySlug(slug)
  if (!post) notFound()

  const { default: Body } = await import(`@/content/posts/en/${slug}.mdx`)

  return (
    <Container className="max-w-3xl py-12">
      <article className="flex flex-col gap-10">
        {/* 영어판은 언제나 한국어 원문이 있어 "한국어로 읽기" 링크를 보여 줌 */}
        <PostHeader post={post} locale="en" hasOtherLanguage />
        <PostProse>
          <Body />
        </PostProse>
      </article>
      <div className="mt-12 flex flex-col items-start gap-8 border-t pt-8">
        <PostNav {...getAdjacentEnglishPosts(slug)} locale="en" />
        <Link href="/en/blog" className={cn(buttonVariants({ variant: "outline" }), "accent-hover")}>
          <ArrowLeftIcon data-icon="inline-start" />
          {UI.en.backToList}
        </Link>
      </div>
    </Container>
  )
}
