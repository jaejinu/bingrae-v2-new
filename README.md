# 부라보콘 제품 페이지

빙그레 부라보콘 제품 페이지 디자인 콘셉트입니다. 외부 프레임워크나 빌드 과정 없이 HTML/CSS/JavaScript로 구성했습니다.

## 실행

`public/index.html`을 바로 열거나 정적 서버로 실행하세요.

```bash
npx serve public
# 또는
python3 -m http.server 4173 -d public
```

## 구조

```
public/
├── index.html        # 마크업 (header · hero · story · flavor · moment · footer)
├── style.css         # 기본 레이아웃과 반응형
├── celebration.css   # 아트 디렉션 덮어쓰기 (색상 토큰, 장식, 애니메이션, 모바일 메뉴)
├── script.js         # 스크롤 진행 바, 등장 효과, 맛 탭, 하트 버튼, 모바일 메뉴
└── assets/
    ├── bravo.png     # 부라보콘 바닐라 제품 이미지
    └── favicon.svg
```

`celebration.css`는 `style.css` 다음에 로드되어 같은 선택자를 덮어씁니다. 색상 토큰(`:root`)도 `celebration.css` 값이 최종 적용됩니다.

## 배포

Vercel 정적 배포이며 `vercel.json`의 `outputDirectory`가 `public`입니다.

## 메모

- 기존 사이트에는 `main` 내부 섹션과 스타일을 이식할 수 있습니다. header와 footer는 예시입니다.
- 800px 이하에서는 header 메뉴가 햄버거 버튼 + 드롭다운으로 바뀝니다. 링크 클릭, Esc, 바깥 클릭으로 닫힙니다.
- 폰트는 Google Fonts의 Noto Sans KR을 사용하며 네트워크가 없으면 시스템 글꼴로 표시됩니다.
- 출시 55년과 누적 판매 수치는 2025년 기준입니다.
- 하트 인사 버튼은 화면 효과이며 서버에 데이터를 저장하지 않습니다.

참고: https://www.bing.co.kr/product/detail?PDT=191 · https://binggrae-moment.vercel.app/?diagnose=1 · https://www.planetono.space/
