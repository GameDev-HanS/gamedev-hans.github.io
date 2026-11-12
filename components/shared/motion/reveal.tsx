"use client"

import { motion } from "motion/react"

import { fadeUp } from "@/lib/motion"

// 스크롤해서 화면에 들어올 때 한 번만 아래에서 살짝 올라오며 나타납니다 (다시 스크롤해도 재생하지 않음).
// 목록에서는 as="li"로 항목마다 따로 씁니다 → 목록이 길어도 각 항목이 자기 차례에 나타남.
// data-motion: JS가 꺼진 브라우저에서는 app/layout.tsx의 <noscript> 규칙이 바로 보이게 합니다.
export function Reveal({
  as = "div",
  delay = 0,
  className,
  children,
}: {
  as?: "div" | "li"
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  const Tag = as === "li" ? motion.li : motion.div
  return (
    <Tag
      data-motion
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      // inherit: MotionConfig의 공통 시간·곡선에 delay만 더함
      transition={{ inherit: true, delay }}
    >
      {children}
    </Tag>
  )
}
