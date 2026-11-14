# 콘텐츠 관리

> 갱신: 2026-11-14 · 현재 버전 v1.1.2

개발 로드맵(T-번호)은 v1.1.2로 마쳤습니다. 이제 사이트는 **파일을 추가·수정해서 업데이트**합니다. 이 문서는 추가할 수 있는 정보와 지금 채워진 정도를 관리합니다.

- 작성 방법(필드 예시, 이미지 크기, 빌드 실패 시 대처): [docs/writing-posts.md](../../docs/writing-posts.md)
- 콘텐츠만 바꾸면 **버전은 올리지 않습니다.** 커밋·푸시하면 다시 빌드되어 사이트에 반영됩니다.
- 새 기능이 필요할 때만 `/pm`으로 작업을 추가합니다 (아래 "기능이 필요한 항목").

## 한눈에 보기

| 정보 | 파일 | 현황 | 다음에 할 일 |
| ---- | ---- | ---- | ------------ |
| 블로그 글 | `content/posts/<slug>.mdx` | 1개 (영어판 1개) | 새 글 쓰기 |
| 게임 평점 | `content/games/*.json`의 `rating` | 0 / 22 | 1~5 정수 |
| 게임 소감 | `comment` (영어 `commentEn`) | 0 / 22 | 한 줄 소감 |
| 게임 표지 | `cover` + `coverCredit`, `public/images/games/<연도>/` | 0 / 22 | 허락된 이미지만 |
| 게임 상태 | `status` | 8 / 22 | playing·cleared·dropped·wishlist |
| 게임 날짜 | `startedAt` / `endedAt` | 9 / 22, 8 / 22 | YYYY-MM-DD |
| 게임 플레이 시간 | `playtime` | 14 / 22 | 시간 단위 숫자 |
| 새 게임 | `content/games/<연도>.json` | 22개 (2026 18, earlier 4) | 플레이할 때마다 추가 |
| 소개 | `content/profile.json` (영어 `content/en/profile.json`) | 채워짐 | 한 줄 소개·관심 분야·공부 중 갱신 |
| 경력·학력·자격증 | `content/timeline.json` (영어 `content/en/timeline.json`) | 4개 | 새 항목은 두 파일에 같은 순서로 |
| 기술 스택 | `content/skills.json` | 채워짐 | 새 기술 추가 |
| 블로그 태그 이름 | `content/tags.json` | 사용 중 | 새 태그의 한글 이름 |
| 배경 음악 | `content/music.json` + `public/audio/*.mp3` | 없음 (버튼 숨김) | 저작권 무료 음원 |

## 1. 블로그 글

- [ ] 새 글 (`content/posts/<slug>.mdx`, 태그는 영문 slug, 새 태그는 `content/tags.json`에 한글 이름)
- [ ] (선택) 영어판 `content/posts/en/<slug>.mdx` — title·summary만 frontmatter
- 사진은 WebP 가로 1600px, 영상은 Supabase에 올리고 `<Video>` (가이드 2·3장)

## 2. 게임 정보

- [ ] 평점·소감 채우기 (22개 모두 비어 있음). 영어 페이지에도 소감을 보이려면 `commentEn`
- [ ] 비어 있는 상태·시작일·끝낸 날·플레이 시간 채우기
- [ ] 표지: **허락된 이미지만** (직접 찍은 스크린샷, 이용 조건을 확인한 공식 프레스 킷). Steam 상점 이미지 금지. WebP 가로 600px 이하, `coverCredit` 필수 (영문 병기 권장)
- [ ] 새로 플레이한 게임 추가. 이름이 한글이면 `titleEn`(공식 영문 이름)도
- 해를 넘긴 게임은 다음 해 파일에도 다시 적습니다

## 3. 소개 정보

- [ ] 한 줄 소개(`tagline`), 관심 분야, 지금 공부 중 갱신 — 한국어·영어 파일 함께
- [ ] 경력·학력·자격증 새 항목 — `timeline.json`과 `en/timeline.json`의 항목 수·순서·type이 같아야 함 (다르면 빌드 실패)
- [ ] 기술 스택 새 항목 (`skills.json`)
- [ ] 외부 링크 추가 (`profile.json`의 `links`)

## 4. 배경 음악

- [ ] 저작권 무료 mp3를 `public/audio/`에, 곡 정보를 `content/music.json`에 (라이선스 문구 포함). mp3와 `music.json`을 **둘 다** 넣고 `file` 이름이 맞아야 헤더 음악 버튼과 푸터 출처가 나타남

## 기능이 필요한 항목

데이터만으로는 화면에 나오지 않아 개발이 필요합니다. 원할 때 `/pm`으로 작업을 추가합니다.

- **프로젝트 카드** — `content/projects.json`(지금 빈 배열)을 홈에 카드로 보여 주는 섹션과 호버 효과 (예전 T-205·T-215, 보류)
