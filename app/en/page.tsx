import { CareerTimeline } from "@/components/sections/career-timeline"
import { CertificateList } from "@/components/sections/certificate-list"
import { Hero } from "@/components/sections/hero"
import { ProfileIntro } from "@/components/sections/profile-intro"
import { RecentPosts } from "@/components/sections/recent-posts"
import { SkillStack } from "@/components/sections/skill-stack"
import { getProfile, getSkills, getTimeline } from "@/lib/content"
import { UI } from "@/lib/i18n"
import { pageMetadata } from "@/lib/metadata"
import { getAllEnglishPosts } from "@/lib/posts"

export const metadata = pageMetadata({
  description: UI.en.siteDescription,
  path: "/en",
  locale: "en",
  languages: { ko: "/", en: "/en" },
})

// 영어 홈 (v1.1.0): 한국어 홈(app/page.tsx)과 같은 순서. 소개 데이터는 content/en/의 번역본,
// 최근 글은 번역본이 있는 글만 보여 줍니다.
export default function EnglishHome() {
  const posts = getAllEnglishPosts()
  const timeline = getTimeline("en")
  const career = timeline.filter((item) => item.type !== "certificate")
  const certificates = timeline.filter((item) => item.type === "certificate")
  return (
    <>
      <Hero locale="en" />
      <ProfileIntro profile={getProfile("en")} locale="en" />
      <SkillStack skills={getSkills()} locale="en" />
      <CareerTimeline items={career} locale="en" />
      <CertificateList items={certificates} locale="en" />
      <RecentPosts posts={posts.slice(0, 3)} total={posts.length} locale="en" />
    </>
  )
}
