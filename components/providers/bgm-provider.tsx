"use client"

import * as React from "react"

type BgmContextValue = {
  available: boolean
  playing: boolean
  toggle: () => void
}

const BgmContext = React.createContext<BgmContextValue>({
  available: false,
  playing: false,
  toggle: () => {},
})

export function useBgm() {
  return React.useContext(BgmContext)
}

// 배경 음악 재생 상태 (F015). 루트 레이아웃에 한 번만 두어 사이트 안 페이지 이동에도 끊기지 않게 합니다.
// 방문마다 항상 꺼짐에서 시작하고, 켜고 끈 선택은 어디에도 저장하지 않습니다.
export function BgmProvider({
  src,
  children,
}: {
  src: string | null
  children: React.ReactNode
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)

  const toggle = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    // 재생이 거부되면(파일 오류, 브라우저 정책 등) 꺼짐 상태로 둡니다.
    // play()를 부르면 그 순간 audio.paused가 false가 되고 실패해도 그대로 남으므로,
    // pause()로 audio 상태도 함께 되돌려야 다음 클릭에서 다시 재생을 시도합니다.
    audio.play().then(
      () => setPlaying(true),
      () => {
        audio.pause()
        setPlaying(false)
      }
    )
  }, [])

  const value = React.useMemo(
    () => ({ available: src !== null, playing, toggle }),
    [src, playing, toggle]
  )

  return (
    <BgmContext.Provider value={value}>
      {children}
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="none"
          loop
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />
      )}
    </BgmContext.Provider>
  )
}
