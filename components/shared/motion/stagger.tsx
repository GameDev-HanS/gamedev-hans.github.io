"use client"

import { motion } from "motion/react"

import { STAGGER, fadeUp } from "@/lib/motion"

// 차례 등장: Stagger 안의 StaggerItem들이 위에서부터 gap(기본 STAGGER) 간격으로 하나씩 나타납니다.
// inView를 켜면 처음 그려질 때가 아니라 화면에 들어올 때마다 재생합니다 (나가면 다시 숨겨짐).
// 바깥(Stagger)은 움직이지 않고 안쪽 StaggerItem만 움직여, 화면에 보이는지 재는 기준이 흔들리지 않습니다 (T-128).
// as="ul"과 StaggerItem as="li"로 쓰면 목록 의미(ul/li)를 그대로 유지합니다.
export function Stagger({
  as = "div",
  delay = 0,
  gap = STAGGER,
  inView = false,
  className,
  children,
}: {
  as?: "div" | "ul"
  delay?: number
  gap?: number
  inView?: boolean
  className?: string
  children: React.ReactNode
}) {
  const Tag = as === "ul" ? motion.ul : motion.div
  const play = inView
    ? { whileInView: "show", viewport: { once: false, amount: 0.2 } }
    : { animate: "show" }

  return (
    <Tag
      className={className}
      initial="hidden"
      {...play}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </Tag>
  )
}

// data-motion: JS가 꺼진 브라우저에서는 app/layout.tsx의 <noscript> 규칙이 바로 보이게 합니다.
export function StaggerItem({
  as = "div",
  className,
  children,
}: {
  as?: "div" | "li" | "dt" | "dd"
  className?: string
  children: React.ReactNode
}) {
  const Tag = { div: motion.div, li: motion.li, dt: motion.dt, dd: motion.dd }[as]
  return (
    <Tag data-motion className={className} variants={fadeUp}>
      {children}
    </Tag>
  )
}
