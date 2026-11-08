import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"

import { Container } from "@/components/layout/container"

// T-108 스파이크용 최소 글 상세 페이지. 글 데이터 로더(T-109)와 상세 화면(T-112)에서 본격적으로 바꿉니다.
const POSTS_DIR = path.join(process.cwd(), "content", "posts")

// 빌드 시 content/posts/*.mdx마다 정적 페이지를 만들고, 그 밖의 주소는 404
export function generateStaticParams() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({ slug: file.replace(/\.mdx$/, "") }))
}

export const dynamicParams = false

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params
  const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, `${slug}.mdx`), "utf8"))
  const { default: Post } = await import(`@/content/posts/${slug}.mdx`)

  return (
    <Container className="py-12">
      <h1 className="mb-6 font-heading text-3xl font-bold">{String(data.title)}</h1>
      <Post />
    </Container>
  )
}
