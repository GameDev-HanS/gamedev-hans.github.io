import { Container } from "@/components/layout/container"
import { PostList } from "@/components/sections/post-list"
import { PageHeader } from "@/components/shared/page-header"
import { TagFilter } from "@/components/shared/tag-list"
import { pageMetadata } from "@/lib/metadata"
import { getAllPosts, getAllTags } from "@/lib/posts"

export const metadata = pageMetadata({
  title: "블로그",
  description: "게임 개발 공부와 개발 과정, 일상 기록",
  path: "/blog",
})

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <Container className="flex flex-col gap-8 py-12">
      <PageHeader title="블로그" description="게임 개발 공부와 개발 과정, 일상 기록" />
      {posts.length > 0 && <TagFilter tags={getAllTags()} total={posts.length} current="all" />}
      <PostList posts={posts} />
    </Container>
  )
}
