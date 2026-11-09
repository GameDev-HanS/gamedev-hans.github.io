// 사이트 공통 애니메이션 값. 모든 효과가 이 값을 써서 같은 리듬으로 움직입니다 (은은하게).
// 이동은 transform(y)와 opacity만 씁니다 (레이아웃이 밀리지 않고 GPU로 부드럽게 처리됨).

/** 한 번의 등장에 걸리는 시간 (초) */
export const DURATION = 0.35
/** 아래에서 올라오는 거리 (px) */
export const DISTANCE = 10
/** 차례 등장할 때 항목 사이 간격 (초) */
export const STAGGER = 0.06
/** 빠르게 시작해 부드럽게 멈추는 곡선 */
export const EASE = [0.22, 1, 0.36, 1] as const

/** 등장 전·후 상태 (Stagger·Reveal이 함께 씀) */
export const fadeUp = {
  hidden: { opacity: 0, y: DISTANCE },
  show: { opacity: 1, y: 0 },
}
