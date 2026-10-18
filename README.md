# 빙그레할 틈 — Everyday moments of small joy

빙그레 브랜드 리뉴얼 콘셉트 사이트(개인 포트폴리오, 비공식)의 정적 빌드본입니다.
`binggrae-moment-five.vercel.app`에서 저장한 Nuxt SSG 결과물이며 원본 Nuxt 소스는 포함되어 있지 않습니다.

## 실행

> **`npm install`은 필요 없습니다.** 이 저장소는 이미 빌드된 정적 파일이라 `package.json`이 없고, `npm install`을 실행하면 오류가 납니다.

저장소 루트에서 정적 서버만 띄우면 됩니다. 경로가 `/`로 시작하므로 `index.html`을 파일로 바로 열면 동작하지 않습니다.

```bash
node start-preview.mjs    # 별도 설치 없이 실행 → http://127.0.0.1:4175/
# 또는
npx serve .
# 또는
python3 -m http.server 4175
```

포트를 바꾸려면 `PORT=3000 node start-preview.mjs`처럼 실행합니다.

## 페이지

**Nuxt 빌드 페이지** (원본 빌드본, 수정하지 않음)

| 경로 | 제목 | 내용 |
|---|---|---|
| `/` | 빙그레할 틈 | 메인 (Moments · Icons · Look Closer · Time · Stories · Featured · Today · Your Moment · News) |
| `/brandbook` | 단지, 기록으로 만나는 50년 | 바나나맛우유 브랜드북 |
| `/icons/samanco`, `/icons/yoplait` | 빙그레할 틈 | 제품별 상세 |
| `/icons/banana-milk`, `/icons/bravo` | 빙그레할 틈 | 제품별 상세. 사이트 안의 링크는 각각 `/banana-milk/`, `/bravo/`로 연결됨 |

**독립 페이지** (HTML/CSS/JS, 폴더별로 작업)

| 경로 | 제목 | 작업 폴더 | 내용 |
|---|---|---|---|
| `/branding/` | 우리의 일상을, 빙그레 — Brand Story | `branding/` | 빙그레 브랜드 스토리 |
| `/banana-milk/` | 바나나맛우유 — 단지, 행복한 순간 | `banana-milk/` | 바나나맛우유 제품 페이지 |
| `/bravo/` | 부라보콘 — 하트 하나, 클래식 하나 | `bravo/` | 부라보콘 인터랙티브 제품 페이지 |
| `/banana-milk/bravo/` | — | — | 예전 주소. `/bravo/`로 자동 이동 |

메인 헤더와 모바일 메뉴에는 `enhancements/page-links.js`가 "브랜드", "바나나맛우유", "부라보콘" 링크를 추가합니다.

## 추가 페이지 작업 안내

기존 메인, `/brandbook`, `/icons/banana-milk`는 변경하지 않았습니다.
새로운 브랜드 페이지 작업은 `branding/`, 바나나맛우유 작업은 `banana-milk/`, 부라보콘 작업은 `bravo/`에서 진행합니다.
각 폴더에는 HTML, CSS, JavaScript와 필요한 이미지가 함께 들어 있습니다.
기존 Nuxt 번들과 독립된 HTML 페이지이므로 기존 앱에서 연결할 때는
`<a href="/branding/">브랜드 이야기</a>`, `<a href="/banana-milk/">바나나맛우유</a>`처럼
일반 링크로 이동하세요. 생성된 Nuxt 번들에 라우트를 직접 추가할 필요가 없습니다.
상세 인계 사항은 `PAGE-HANDOFF.md`를 참고하세요.

## 구조

```
index.html              # 메인 페이지 (SSR 결과 + __NUXT_DATA__)
brandbook/, icons/      # 하위 페이지 (Nuxt 빌드)
branding/, banana-milk/, bravo/   # 독립 페이지
start-preview.mjs       # 로컬 미리보기 서버 (node start-preview.mjs)
_startup-fixed/         # 메인 페이지가 쓰는 Nuxt 번들 (buildAssetsDir)
_nuxt/                  # 하위 페이지가 쓰는 Nuxt 번들 (_startup-fixed와 내용 동일)
_external/              # Google Fonts, Pretendard 로컬 사본
enhancements/           # 프리로더, 히어로 시퀀스 등 추가 스크립트(three.js 포함)와 제품 이미지
models/teum/            # 제품 3D 모델 (.glb)
images/, archive/, products/, icons/, fonts/
download-manifest.json, supplement-manifest.json   # 저장 기록 (배포 제외)
```

## 배포

Vercel 정적 배포입니다. GitHub `main`에 push하면 자동 배포되며, `.vercelignore`에 적힌 파일은 배포에서 제외됩니다.

## 메모

- 모바일(헤더의 "메뉴" 버튼)은 Nuxt 앱에 이미 구현되어 있습니다.
- `/images/story-*.jpg` 5개는 원본 사이트에서도 404라 포함되어 있지 않습니다.

## 부라보콘 인터랙티브 페이지

새 페이지는 `/bravo/`이며 `bravo/` 폴더에서 독립적으로 작업합니다. 제품 드래그, 스크롤 역사 카드, 풍미 선택, 커팅 표시 슬라이더와 하트 놀이터를 포함합니다.
메인·모바일 메뉴와 기존 부라보콘 링크는 새 페이지로 연결되며, `/banana-milk/bravo/`는 호환 이동 페이지입니다.

Node.js 실행: `node start-preview.mjs` → `http://127.0.0.1:4175/bravo/`
별도 설치나 빌드가 필요하지 않습니다. 출시 55년과 판매량은 2025년 기준입니다.
