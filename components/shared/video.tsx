import { withBasePath } from "@/lib/base-path"

type VideoProps = {
  /** 영상 주소 (Supabase Storage 공개 URL 등, https만) */
  src: string
  /** 영상 이름 (필수). 화면 낭독기가 읽는 플레이어 이름 */
  title: string
  /** 재생 전 보일 이미지 (선택). "/images/..." 또는 https 주소 */
  poster?: string
  /** 한국어 자막 파일 (선택, WebVTT .vtt). "/..." 또는 https 주소. 다른 사이트 주소면 그 서버가 CORS를 허용해야 함 */
  captions?: string
}

const HTTPS_URL = /^https:\/\/\S+$/
// public/ 아래 파일 경로 ("/images/a.webp"). "//"로 시작하는 주소와 ".."는 막음
const LOCAL_PATH = /^\/(?!\/)(?!.*\.\.)\S+$/

/** 로컬 경로면 basePath를 붙이고, https면 그대로. 둘 다 아니면 빌드 실패 */
function resolveAsset(name: string, value: string): string {
  if (HTTPS_URL.test(value)) return value
  if (LOCAL_PATH.test(value)) return withBasePath(value)
  throw new Error(`<Video>: ${name}는 "/..." 경로나 https:// 주소여야 합니다 — ${value}`)
}

// 글 본문 영상 플레이어 (F008, MDX에서 <Video src="..." title="..." />).
// 브라우저 기본 컨트롤(재생·일시정지·전체 화면)을 쓰고 클라이언트 JS는 없습니다.
// - preload="metadata": 페이지를 열 때 영상 전체를 받지 않음 (Supabase 무료 전송량 절약)
// - playsInline: 모바일에서 전체 화면으로 강제 전환되지 않고 본문 안에서 재생
// - 16:9 고정 틀: 영상 정보를 받기 전에도 높이가 정해져 본문이 밀리지 않음. 세로 영상은 좌우 여백(object-contain)
// - not-prose: 글 상세 prose 서식이 video 여백·크기를 덮어쓰지 않게 함
// - captions가 있으면 crossOrigin="anonymous"로 영상도 CORS 요청이 되므로, src 서버가 CORS를 허용해야 재생됨
//   (Supabase 공개 객체는 Access-Control-Allow-Origin: * — 다른 호스팅으로 옮기면 확인 필요)
// 잘못 적은 값은 빌드 때 바로 알 수 있게 실패시킵니다 (MDX 안의 props는 타입 검사가 되지 않음).
export function Video({ src, title, poster, captions }: VideoProps) {
  // http는 https 사이트에서 막히므로 영상은 https만 허용
  if (typeof src !== "string" || !HTTPS_URL.test(src)) {
    throw new Error(`<Video>: src는 https:// 주소여야 합니다 — ${String(src)}`)
  }
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error(`<Video>: title(영상 이름)을 적어 주세요 — ${src}`)
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border bg-black">
      <video
        src={src}
        poster={poster ? resolveAsset("poster", poster) : undefined}
        controls
        playsInline
        preload="metadata"
        aria-label={title}
        // 자막 파일을 다른 주소에서 읽으려면 CORS 요청이 필요함
        crossOrigin={captions ? "anonymous" : undefined}
        className="aspect-video w-full object-contain"
      >
        {captions && <track kind="captions" src={resolveAsset("captions", captions)} srcLang="ko" label="한국어" />}
        {/* video를 지원하지 않는 브라우저에서만 보이는 대체 내용 */}
        이 브라우저에서는 영상을 재생할 수 없습니다. <a href={src}>영상 파일 열기 ({title})</a>
      </video>
    </div>
  )
}
