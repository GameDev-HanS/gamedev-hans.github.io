"use client"

import { MotionConfig } from "motion/react"

import { DURATION, EASE } from "@/lib/motion"

// 모든 애니메이션의 기본 시간·곡선을 정하고, OS의 "동작 줄이기" 설정을 따르게 합니다.
// reducedMotion="user": 동작 줄이기를 켠 사용자에게는 이동(transform)을 빼고 투명도만 바꿉니다.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION, ease: EASE }}>
      {children}
    </MotionConfig>
  )
}
