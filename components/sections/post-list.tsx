import { PostCard } from "@/components/shared/post-card"
import type { Post } from "@/lib/posts"

// 블로그 글 목록 (최신순 그리드). 글이 없으면 안내 문구를 보여 줍니다.
export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">아직 글이 없습니다.</p>
    )
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  )
}
