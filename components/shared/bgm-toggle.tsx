"use client"

import { MusicIcon, VolumeXIcon } from "lucide-react"

import { useBgm } from "@/components/providers/bgm-provider"
import { Button } from "@/components/ui/button"

// 헤더의 배경 음악 켜기/끄기 버튼. 음원이 없으면 렌더하지 않습니다.
export function BgmToggle() {
  const { available, playing, toggle } = useBgm()
  if (!available) return null

  const label = playing ? "배경 음악 끄기" : "배경 음악 켜기"
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={label}
      title={label}
    >
      {playing ? (
        <MusicIcon className="text-neon-cyan drop-shadow-[0_0_6px_var(--neon-cyan-glow)]" />
      ) : (
        <VolumeXIcon />
      )}
    </Button>
  )
}
