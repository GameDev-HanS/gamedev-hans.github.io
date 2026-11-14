import { Reveal } from "@/components/shared/motion/reveal"
import { PostCard } from "@/components/shared/post-card"
import { STAGGER } from "@/lib/motion"
import type { Post } from "@/lib/posts"

// 블로그 글 목록 (최신순 그리드). 카드마다 스크롤해서 화면에 들어올 때마다 나타나고,
// 같은 줄의 카드는 왼쪽부터 조금씩 늦게 나타납니다 (목록이 길어도 화면 밖 카드는 기다리지 않음).
// 글이 없으면 안내 문구를 보여 줍니다. 태그별 글 목록(T-308)도 이 섹션을 그대로 씁니다.
const COLUMNS = 3

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">아직 글이 없습니다.</p>
    )
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <Reveal as="li" key={post.slug} delay={(index % COLUMNS) * STAGGER}>
          <PostCard post={post} />
        </Reveal>
      ))}
    </ul>
  )
}
