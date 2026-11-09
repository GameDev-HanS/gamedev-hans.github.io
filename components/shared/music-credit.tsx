import type { BackgroundMusic } from "@/lib/music"

// 푸터의 배경 음악 출처·라이선스 문구. 음원이 없으면 아무것도 표시하지 않습니다.
export function MusicCredit({ music }: { music: BackgroundMusic | null }) {
  if (!music) return null

  return (
    <p className="break-words text-center sm:text-left">
      배경 음악: {music.title} — {music.artist} (
      {music.sourceUrl ? (
        <a
          href={music.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-primary"
        >
          {music.source}
        </a>
      ) : (
        music.source
      )}
      , {music.license})
    </p>
  )
}
