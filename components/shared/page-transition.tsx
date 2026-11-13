"use client"

import { ViewTransition, useSyncExternalStore, type ReactNode } from "react"

// 하이드레이션 전(서버 HTML·첫 렌더)에는 false, 그 뒤에는 true
const subscribe = () => () => {}
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

// 페이지 전환 크로스페이드 (T-122)
// 레이아웃의 <main> 안에 한 번만 감쌉니다. 사이트 안 이동은 React transition이라
// 안쪽 내용이 바뀌면 update 애니메이션(page-fade 클래스)이 재생됩니다.
// (enter/exit를 쓰는 방향 슬라이드와 달리 레이아웃에 둬도 동작하므로 페이지마다 감쌀 필요가 없음)
// 하이드레이션 전에는 "none"으로 둡니다. 그러지 않으면 첫 접속 때 React가 하이드레이션 중의 본문 교체에도
// 전환을 걸어, 글꼴·이미지를 기다리느라 본문이 늦게 보입니다.
// (app/loading.tsx는 이동 때 회색 스켈레톤이 잠깐 끼어 보여서 2026-11-13에 제거)
// 애니메이션 모양은 app/globals.css의 ::view-transition-*(.page-fade) 규칙에 있습니다.
export function PageTransition({ children }: { children: ReactNode }) {
  const hydrated = useHydrated()
  return (
    <ViewTransition update={hydrated ? "page-fade" : "none"} default="none">
      {children}
    </ViewTransition>
  )
}
