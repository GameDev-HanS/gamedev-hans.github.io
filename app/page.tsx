import { CareerTimeline } from "@/components/sections/career-timeline"
import { CertificateList } from "@/components/sections/certificate-list"
import { Hero } from "@/components/sections/hero"
import { ProfileIntro } from "@/components/sections/profile-intro"
import { RecentPosts } from "@/components/sections/recent-posts"
import { SkillStack } from "@/components/sections/skill-stack"
import { getProfile, getSkills, getTimeline } from "@/lib/content"
import { pageMetadata } from "@/lib/metadata"
import { getAllPosts } from "@/lib/posts"

// 제목·설명은 사이트 기본값(siteConfig), canonical·og:url만 홈 주소로
export const metadata = pageMetadata({ path: "/" })

// 홈: 히어로 → 프로필 → 기술 스택 → 경력·학력 → 자격증 → 최근 글 (2026-11-13 소개 페이지를 홈으로 합침)
export default function Home() {
  const posts = getAllPosts()
  // timeline.json 하나에서 자격증만 따로 떼어 별도 섹션으로 보여 줌
  const timeline = getTimeline()
  const career = timeline.filter((item) => item.type !== "certificate")
  const certificates = timeline.filter((item) => item.type === "certificate")
  return (
    <>
      <Hero />
      <ProfileIntro profile={getProfile()} />
      <SkillStack skills={getSkills()} />
      <CareerTimeline items={career} />
      <CertificateList items={certificates} />
      <RecentPosts posts={posts.slice(0, 3)} total={posts.length} />
    </>
  )
}
