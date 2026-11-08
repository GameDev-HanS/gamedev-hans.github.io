import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { PostList } from "@/components/sections/post-list"
import { PageHeader } from "@/components/shared/page-header"
import { getAllPosts } from "@/lib/posts"

export const metadata: Metadata = {
  title: "블로그",
  description: "게임 개발 공부와 개발 과정, 일상 기록",
}

export default function BlogPage() {
  return (
    <Container className="flex flex-col gap-8 py-12">
      <PageHeader title="블로그" description="게임 개발 공부와 개발 과정, 일상 기록" />
      <PostList posts={getAllPosts()} />
    </Container>
  )
}
