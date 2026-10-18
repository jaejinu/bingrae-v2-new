# 붕어싸만코 브랜드 페이지

## 파일 구성
- `index.html`: 접근성 속성을 포함한 페이지 구조와 제품 이야기
- `style.css`: 기존 기본 스타일과 공통 유틸리티
- `shared-layout.css`: 공통 헤더, 모바일 메뉴, 푸터
- `experience.css`: 싸만코 제품 화면과 반응형 레이아웃
- `script.js`: 모션 설정, 제품 드래그/키보드 조작, 스크롤 장면, 맛 설명, 메시지, 메뉴
- `assets/samanco.png`: 빙그레 공식 제품 이미지
- `.prettierrc.json`: 2칸 들여쓰기와 코드 포맷 규칙

CSS는 기본 → 공통 레이아웃 → 제품 화면 순으로 적용됩니다.
기존 상위 사이트 메뉴 경로는 유지했습니다. 단독 실행 시 상위 사이트 페이지는 제공되지 않습니다.
기존 이미지 `assets/bravo.png`는 참조하지 않지만 원본 자산 보존을 위해 남겼습니다.

## 실행
정적 사이트이므로 index.html을 열거나 이 폴더에서 정적 HTTP 서버를 실행합니다.
Google Fonts는 인터넷 연결이 필요하며 실패하면 시스템 글꼴을 사용합니다.

## 공식 참고 자료
2026-10-19 확인. 국내 제품 페이지를 현재 라인업 기준으로 사용합니다.
- https://www.bing.co.kr/product/detail?PDT=17
- https://www.bing.co.kr/product/detail?PDT=55 (수출용)
- https://www.bing.co.kr/news/news_announced_view?anno_idx=176 (2024년 딸기블라썸 한정판)
- https://www.bing.co.kr/news/news_story_view?sto_idx=10 (2022년 호두과자 출시 이야기)
- 이미지: https://www.bing.co.kr/upload/brand/2024/05/b55200c9-20ba-4b68-b2a2-db847ce8a61c.png

## 확인
- JavaScript 문법 및 Prettier 포맷
- 1440px / 390px 화면, 이미지 로딩, 가로 넘침
- 방향키/Home 기울기 조작, 맛 버튼, 메시지 변경, 모션 버튼
- 모바일 메뉴 열기, Escape 닫기, 현재 페이지 링크 선택 후 닫기

드래그 이벤트와 OS 모션 감소 대응 로직은 기존 구현을 유지했습니다.
