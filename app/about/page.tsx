import type { Metadata } from "next"

import { ProfileIntro } from "@/components/sections/profile-intro"
import { getProfile } from "@/lib/content"

export function generateMetadata(): Metadata {
  const { name } = getProfile()
  return {
    title: "소개",
    description: `게임 개발자 ${name}의 프로필·기술 스택·프로젝트·경력`,
  }
}

// 소개 페이지. 섹션만 조립합니다 (기술 스택·프로젝트·경력은 T-204~T-207에서 추가).
export default function AboutPage() {
  return <ProfileIntro profile={getProfile()} />
}
