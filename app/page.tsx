import { Hero } from "@/components/sections/hero"
import { RecentPosts } from "@/components/sections/recent-posts"
import { getAllPosts } from "@/lib/posts"

export default function Home() {
  const posts = getAllPosts()
  return (
    <>
      <Hero />
      <RecentPosts posts={posts.slice(0, 3)} total={posts.length} />
    </>
  )
}
