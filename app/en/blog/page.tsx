import { Container } from "@/components/layout/container"
import { PostList } from "@/components/sections/post-list"
import { PageHeader } from "@/components/shared/page-header"
import { UI } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { getAllEnglishPosts } from "@/lib/posts"

export const metadata = pageMetadata({
  title: UI.en.blogTitle,
  description: UI.en.blogDescription,
  path: "/en/blog",
  locale: "en",
  languages: { ko: "/blog", en: "/en/blog" },
})

// 영어 글 목록 (v1.1.0): 번역본이 있는 글만, 최신순. 영어판에는 태그별 목록이 없어 태그 선택은 두지 않습니다.
export default function EnglishBlogPage() {
  return (
    <Container className="flex flex-col gap-8 py-12">
      <PageHeader title={UI.en.blogTitle} description={UI.en.blogDescription} />
      <PostList posts={getAllEnglishPosts()} locale="en" />
    </Container>
  )
}
