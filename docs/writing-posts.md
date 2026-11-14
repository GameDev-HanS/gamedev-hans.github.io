# 콘텐츠 작성 가이드

블로그 글, 사진, 영상, 플레이한 게임 기록, 배경 음악을 추가하는 방법입니다. **코드는 고치지 않고 파일만 추가**하면 됩니다.

## 한눈에 보기

| 무엇 | 어디에 |
| ---- | ------ |
| 글 | `content/posts/<slug>.mdx` |
| 글 사진 | `public/images/posts/<slug>/` |
| 태그 한글 이름 | `content/tags.json` |
| 영상 | Supabase Storage `videos` 버킷 → 글에 `<Video>` |
| 게임 기록 | `content/games/<연도>.json`, 연도를 모르는 옛날 게임은 `content/games/earlier.json` |
| 게임 표지 | `public/images/games/<연도>/` (earlier는 `public/images/games/earlier/`) |
| 배경 음악 | `public/audio/<파일>.mp3` + `content/music.json` |
| 영어판 (선택) | `content/posts/en/<slug>.mdx`, `content/en/profile.json`, `content/en/timeline.json` ([6. 영어판 넣기](#6-영어판-넣기-선택)) |

- 파일을 추가하고 커밋·푸시하면 GitHub Actions가 사이트를 다시 빌드해 배포합니다.
- 형식이 틀리면 **빌드가 실패**하고 배포되지 않습니다. 오류 메시지 맨 앞에 파일 이름이 나옵니다 ([빌드가 실패했을 때](#빌드가-실패했을-때)).
- 푸시 전에 `npm run dev`(개발 서버, http://localhost:3000)로 미리 보거나 `npm run build`로 오류가 없는지 확인할 수 있습니다.

---

## 1. 새 글 쓰기

### 파일 만들기

`content/posts/<slug>.mdx` 파일을 만듭니다. 파일 이름이 글 주소가 됩니다 (`/blog/<slug>`).

- 파일 이름(slug)은 **영문 소문자·숫자·하이픈**만 씁니다. 예: `game-loop-basics.mdx`
- 한글·대문자·공백·밑줄은 빌드 실패입니다.

### 글 정보 (frontmatter)

파일 맨 위에 `---`로 감싼 글 정보를 적습니다.

```mdx
---
title: 게임 루프 이해하기
date: 2026-11-20
summary: 고정 시간 간격 업데이트와 렌더링을 나누는 이유를 정리했습니다.
tags: [game-programming, devlog]
thumbnail: /images/posts/game-loop-basics/cover.webp
---

## 첫 번째 제목

본문을 씁니다.
```

| 필드 | 필수 | 설명 |
| ---- | ---- | ---- |
| `title` | 필수 | 글 제목 |
| `date` | 필수 | `YYYY-MM-DD`. 목록은 날짜 최신순 |
| `summary` | 필수 | 목록 카드에 보일 한 줄 요약 |
| `tags` | 필수 | 1개 이상. **영문 slug**(소문자·숫자·하이픈)만, 같은 태그 두 번 금지, `all`은 쓸 수 없음 |
| `thumbnail` | 선택 | 대표 이미지. `/images/posts/`로 시작하는 경로이고 파일이 실제로 있어야 함 |

### 본문에서 쓸 수 있는 것

- 제목(`##`), 목록, 인용(`>`), 링크, 굵게, 표(`| 분류 | 내용 |`), 체크리스트(`- [ ]`)
- 코드 블록은 언어 이름을 적으면 색이 입혀지고 패널 위에 언어 이름이 보입니다. 언어를 적지 않으면 색 없이 보입니다.

  ````mdx
  ```csharp
  transform.Rotate(Vector3.up, speed * Time.deltaTime);
  ```
  ````

- 영상은 아래 [3. 영상 넣기](#3-영상-넣기)를 봅니다.

### 태그 한글 이름 붙이기

`tags`에는 영문 slug만 쓰고, 화면에 보일 한글 이름은 `content/tags.json`에 적습니다.

```json
{
  "blog": "블로그",
  "devlog": "개발 일지",
  "shader": "셰이더",
  "game-programming": "게임 프로그래밍"
}
```

- 새 태그를 쓸 때 여기에 한 줄 추가합니다. 적지 않으면 slug가 그대로 보입니다 (빌드는 통과).
- 태그 페이지 주소는 항상 `/blog/tags/<영문 slug>`입니다.
- 쉼표 빠짐·마지막 줄 쉼표 같은 JSON 오류는 빌드 실패입니다.

---

## 2. 사진 넣기

1. 글마다 폴더를 만듭니다: `public/images/posts/<slug>/`
2. 사진은 **WebP, 가로 1600px 이하**로 줄여서 넣습니다 (사이트가 이미지를 자동으로 줄여 주지 않음).
   - 웹 도구: [Squoosh](https://squoosh.app) — 파일을 올리고 WebP, Resize 너비 1600 선택
   - ffmpeg가 있으면:

     ```powershell
     ffmpeg -i 원본.png -vf "scale='min(1600,iw)':-2" -quality 80 cover.webp
     ```

3. 파일 이름도 영문·숫자·하이픈으로 씁니다.
4. 본문에서는 `public` 뒤 경로로 적습니다.

   ```mdx
   ![보스 패턴 설계 메모](/images/posts/game-loop-basics/boss-pattern.webp)
   ```

   `[ ]` 안의 설명은 화면 낭독기가 읽으므로 사진 내용을 짧게 적습니다.

---

## 3. 영상 넣기

영상은 저장소에 넣지 않고 Supabase Storage(무료 플랜)에 올려 주소만 글에 적습니다.

### 3-1. 영상 줄이기

- **파일 하나 50MB 이하** (업로드 한도). 1분에 10~15MB 정도가 목표입니다.
- H.264 영상 + AAC 음성 MP4, 1080p 이하(본문 폭이면 720p도 충분).
- `+faststart`를 넣으면 재생이 바로 시작됩니다.

```powershell
ffmpeg -i 원본.mp4 -vf "scale=-2:'min(1080,ih)'" -c:v libx264 -preset slow -crf 26 -c:a aac -b:a 128k -movflags +faststart boss-fight.mp4
```

크기가 크면 `-crf` 값을 28~30으로 올리거나 `1080`을 `720`으로 낮춥니다.

### 3-2. 파일 이름

**영문·숫자·`-`·`_`만** 씁니다. 한글 이름(`15연승.mp4`)은 Supabase가 거부합니다(`InvalidKey`). 예: `boss-fight_2026-11.mp4`

### 3-3. Supabase에 올리기

1. supabase.com 대시보드 → 프로젝트 → 왼쪽 **Storage** → `videos` 버킷
2. 영상 파일 업로드
3. 올린 파일 → **Get URL**로 공개 주소 복사
   형식: `https://<project-ref>.supabase.co/storage/v1/object/public/videos/<파일 이름>`

> API 키(anon·service_role)나 DB 비밀번호는 글·저장소 어디에도 적지 않습니다. 공개 주소만 있으면 됩니다.

### 3-4. 글에 넣기

```mdx
<Video
  src="https://<project-ref>.supabase.co/storage/v1/object/public/videos/boss-fight.mp4"
  title="보스전 플레이 영상"
/>
```

| 속성 | 필수 | 설명 |
| ---- | ---- | ---- |
| `src` | 필수 | 영상 주소. **https만** |
| `title` | 필수 | 영상 이름 (화면 낭독기가 읽음). 비우면 빌드 실패 |
| `poster` | 선택 | 재생 전 보일 이미지. `/images/...` 경로 또는 https 주소 |
| `captions` | 선택 | 한국어 자막 파일 (**WebVTT `.vtt`**). `/...` 경로 또는 https 주소 |

자막·표지를 함께 쓰는 예:

```mdx
<Video
  src="https://<project-ref>.supabase.co/storage/v1/object/public/videos/boss-fight.mp4"
  title="보스전 플레이 영상"
  poster="/images/posts/game-loop-basics/boss-poster.webp"
  captions="/images/posts/game-loop-basics/boss-fight.ko.vtt"
/>
```

- 블로그 목록 카드의 "영상" 표시는 `<Video>`가 있으면 자동으로 붙습니다. 코드 블록이나 `{/* 주석 */}` 안에 예시로 적은 `<Video>`는 세지 않습니다.

### 3-5. 무료 플랜 주의

| 항목 | 한도 |
| ---- | ---- |
| 저장 용량 | 1GB (30MB 영상 약 30개) |
| 전송량 | 월 5GB (30MB 영상 약 170회 전체 재생) |
| 파일 1개 | 50MB |
| 일시 정지 | 1주일 동안 활동이 없으면 프로젝트가 멈춤 → 대시보드에서 다시 켜기 |

한도를 넘으면 요금이 청구되지 않고 서비스가 잠시 제한됩니다. 영상은 재생 버튼을 누르기 전에는 거의 내려받지 않습니다.

---

## 4. 게임 기록 추가하기

### 파일

- 그해 플레이한 게임: `content/games/<연도>.json` (예: `2027.json`). 파일을 하나 추가하면 `/games/2027` 페이지와 보기 목록이 자동으로 생깁니다.
- 2026년 전에만 플레이해 정확한 연도를 모르는 게임: `content/games/earlier.json` (전체 보기 `/games`에만 나옴)
- 파일 이름은 네 자리 연도 또는 `earlier.json`만 됩니다. 내용은 게임 배열 `[ ... ]`입니다.

### 필드 예시

```json
[
  {
    "slug": "stellar-blade",
    "title": "스텔라 블레이드",
    "platforms": ["PC (Steam)"],
    "status": "cleared",
    "rating": 4,
    "comment": "전투 손맛이 좋았다.",
    "playtime": 21.5,
    "startedAt": "2026-03-06",
    "endedAt": "2026-06-29",
    "cover": "/images/games/2026/stellar-blade.webp",
    "coverCredit": "직접 촬영한 플레이 화면",
    "trailer": "_VyeH5uteVk"
  }
]
```

| 필드 | 필수 | 설명 |
| ---- | ---- | ---- |
| `slug` | 필수 | 영문 소문자·숫자·하이픈. 한 파일 안에서 중복 금지 |
| `title` | 필수 | 게임 이름 |
| `platforms` | 필수 | 1개 이상. 표기는 `"PC (Steam)"`, `"PC"`, `"모바일"`. 여러 개면 `["PC", "모바일"]` 순서 |
| `status` | 선택 | `playing`(플레이 중) · `cleared`(클리어) · `dropped`(중단) · `wishlist`(하고 싶은 게임). 없으면 "플레이한 게임" 묶음 |
| `rating` | 선택 | 1~5 **정수** |
| `comment` | 선택 | 한 줄 소감 |
| `playtime` | 선택 | 플레이 시간(시간 단위 숫자, 예: `21.5`) |
| `startedAt` / `endedAt` | 선택 | `YYYY-MM-DD`. `endedAt`이 `startedAt`보다 이르면 실패 |
| `cover` | 선택 | 표지 경로. **있으면 `coverCredit`(출처)도 필수** |
| `coverCredit` | 선택 | 표지 출처 문구 (예: `"직접 촬영한 플레이 화면"`, `"OO게임즈 공식 프레스 킷"`) |
| `trailer` | 선택 | 공식 PV 유튜브 영상 ID 11자. `https://www.youtube.com/watch?v=qgJBFa952mY`면 `qgJBFa952mY` |

- 표에 없는 필드(오타 포함)를 적으면 빌드 실패입니다.

### 규칙

- **해를 넘긴 게임**은 다음 해 파일에도 다시 적습니다. 전체 보기(`/games`)에는 가장 최근 연도 것 하나만 보입니다.
- `earlier.json`에 연도 파일과 **같은 slug**를 적으면 빌드 실패입니다. 연도를 알게 되면 `earlier.json`에서 지우고 연도 파일로 옮깁니다.
- **표지**: **허락된 이미지만** 씁니다 — 직접 찍은 플레이 스크린샷, 또는 이용 조건을 확인한 공식 프레스 킷. Steam 상점 이미지처럼 허락 없이 가져온 이미지는 쓰지 않습니다 (공개 저장소라 한 번 푸시하면 지워도 git 기록에 남음). **가로 600px 이하**(약 150KB 이하) WebP로 줄여 `public/images/games/<연도>/`에 둡니다. `earlier.json`의 표지는 `public/images/games/earlier/`. 다른 연도 폴더를 가리키거나 파일이 없으면 빌드 실패입니다.

---

## 5. 배경 음악 넣기

헤더의 음악 버튼과 푸터 출처 문구는 **음원과 정보 파일이 둘 다 있을 때만** 나타납니다.

1. **음원 고르기**: 저작권 무료 음원 중 웹사이트 사용이 허용된 곡을 고르고, 출처 표기 조건(라이선스)을 확인합니다.
2. **mp3 저장**: `public/audio/bgm.mp3`
   - 파일 이름은 영문·숫자·`-`·`_`·`.`만, 확장자는 `.mp3`
3. **정보 파일**: `content/music.json`

   ```json
   {
     "file": "bgm.mp3",
     "title": "곡 제목",
     "artist": "작곡가",
     "source": "출처 사이트 이름",
     "sourceUrl": "https://example.com/track",
     "license": "CC BY 4.0"
   }
   ```

   | 필드 | 필수 | 설명 |
   | ---- | ---- | ---- |
   | `file` | 필수 | `public/audio/` 안의 **파일 이름만** (`audio/bgm.mp3`처럼 경로를 적으면 실패). 실제 파일 이름과 같아야 함 |
   | `title` | 필수 | 곡 제목 |
   | `artist` | 필수 | 작곡가·아티스트 |
   | `source` | 필수 | 출처 이름 |
   | `sourceUrl` | 선택 | 출처 링크 (http/https만). 있으면 푸터에서 새 탭 링크 |
   | `license` | 필수 | 라이선스 문구 |

4. **커밋·푸시**: 다시 빌드해야 버튼이 나타납니다.

- `music.json`만 있고 mp3가 없으면(또는 `file` 이름이 다르면) 빌드는 통과하지만 버튼이 나오지 않습니다. 버튼이 안 보이면 파일 이름부터 확인합니다.
- 방문자가 버튼을 눌러야 재생되고, 새로고침하면 다시 꺼짐에서 시작합니다.

---

## 6. 영어판 넣기 (선택)

한국어 글과 홈 소개에 영어판을 둘 수 있습니다. 영어 페이지는 `/en` 아래에 있고, 헤더의 **EN / KR** 버튼으로 오갑니다.

| 무엇 | 어디에 | 주소 |
| ---- | ------ | ---- |
| 영어 글 | `content/posts/en/<slug>.mdx` (한국어 글과 **같은 파일 이름**) | `/en/blog/<slug>` |
| 영어 프로필 | `content/en/profile.json` | `/en` |
| 영어 경력·학력·자격증 | `content/en/timeline.json` | `/en` |

### 영어 글

```mdx
---
title: Understanding the Game Loop
summary: One-line summary in English.
---

## First heading

Body text in English...
```

- frontmatter에는 **`title`과 `summary`만** 적습니다. 날짜·태그·대표 이미지는 한국어 원문 것을 그대로 씁니다 (다른 필드를 적으면 빌드 실패).
- 본문은 한국어 글과 같은 순서로 옮깁니다. 코드 블록은 코드는 그대로 두고 **주석만** 번역합니다. `<Video title>`도 영어로 적습니다.
- 같은 이름의 한국어 원문이 없으면 빌드 실패입니다.
- 번역본이 있는 글은 `/blog` 카드에 **EN** 표시가 붙고, 글 상단에 "Read in English" 링크가 생깁니다. 영어판에는 태그별 글 목록이 없어 태그 칩은 영문 slug로 표시만 됩니다.

### 영어 소개

- `content/en/profile.json`: `name`, `tagline`, `interests`, `studying`만 적습니다. 사진·링크는 `content/profile.json` 것을 씁니다.
- `content/en/timeline.json`: `content/timeline.json`과 **항목 수·순서·`type`이 같아야** 합니다 (다르면 빌드 실패). 한국어 쪽에 항목을 추가하면 영어 쪽에도 같은 자리에 추가합니다.
- 기술 스택 이름은 원래 영어라서 따로 번역할 파일이 없습니다.

---

## 7. 기타

- **`PAGES_BASE_PATH`**: 배포 워크플로(`.github/workflows/deploy.yml`)가 자동으로 넣으므로 보통은 신경 쓰지 않습니다. 지금 사이트(`<사용자>.github.io`)는 빈 값입니다. 로컬에서 직접 지정해 확인할 때는 **앞 슬래시 필수, 끝 슬래시 금지** 형식으로 씁니다. 예: `/repo` (`repo`, `/repo/`는 틀림)

  ```powershell
  $env:PAGES_BASE_PATH = "/repo"; npm run build
  ```

---

## 빌드가 실패했을 때

1. GitHub 저장소 → **Actions** → 실패한 실행 → build 단계 로그를 엽니다 (또는 로컬에서 `npm run build`).
2. `content/...` 로 시작하는 오류 줄을 찾습니다. 파일 이름과 원인이 함께 나옵니다.

| 오류 예 | 고칠 곳 |
| ------- | ------- |
| `content/posts/a.mdx: 글 정보(frontmatter)가 올바르지 않습니다 — tags.0: 영문 소문자·숫자·하이픈만…` | 태그를 영문 slug로 (`셰이더` → `shader`) |
| `content/posts/a.mdx: thumbnail 파일이 없습니다 — public/images/posts/...` | 이미지 경로·파일 이름 확인 |
| `content/tags.json: JSON 형식이 올바르지 않습니다` | 쉼표·따옴표 확인 |
| `content/games/2026.json: 2번째 게임이 올바르지 않습니다 — …` | 그 게임의 필드 이름·값 확인 (모르는 필드, rating 범위 등) |
| `content/games/earlier.json: 연도 파일에도 있는 게임입니다 — …` | earlier.json에서 그 게임 지우기 |
| `<Video>: src는 https:// 주소여야 합니다` / `title(영상 이름)을 적어 주세요` | `<Video>` 속성 확인 |
| `content/music.json: 배경 음악 정보가 올바르지 않습니다 — file: …` | `file`에 파일 이름만 적기 |
| `content/posts/en/a.mdx: 같은 이름의 한국어 원문(content/posts/a.mdx)이 없습니다` | 영어 글 파일 이름을 원문과 같게 |
| `content/en/timeline.json: 항목 수가 timeline.json과 다릅니다` | 한국어·영어 timeline 항목을 같은 순서로 맞추기 |
