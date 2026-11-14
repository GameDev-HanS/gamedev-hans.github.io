// 영어 페이지(/en 아래) 공통 레이아웃 (v1.1.0). 루트 <html lang="ko">는 모든 페이지가 함께 쓰므로,
// 이 아래 내용만 lang="en"으로 감싸 화면 낭독기·번역기·맞춤법 검사가 영어로 읽게 합니다.
// 헤더·푸터는 루트 레이아웃에 있고, 메뉴 이름은 주소(/en)를 보고 영어로 바뀝니다.
export default function EnglishLayout({ children }: LayoutProps<"/en">) {
  return (
    <div lang="en" className="flex flex-1 flex-col">
      {children}
    </div>
  )
}
