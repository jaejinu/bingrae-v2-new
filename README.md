# 빙그레할 틈 — Everyday moments of small joy

빙그레 브랜드 리뉴얼 콘셉트 사이트(개인 포트폴리오, 비공식)의 정적 빌드본입니다.
`binggrae-moment-five.vercel.app`에서 저장한 Nuxt SSG 결과물이며 원본 Nuxt 소스는 포함되어 있지 않습니다.

## 실행

빌드 과정 없이 루트 디렉터리를 정적 서버로 실행하면 됩니다. 경로가 `/`로 시작하므로 `index.html`을 파일로 바로 열면 동작하지 않습니다.

```bash
npx serve .
# 또는
python3 -m http.server 4175
```

## 페이지

| 경로 | 내용 |
|---|---|
| `/` | 메인 (Moments · Icons · Look Closer · Time · Stories · Featured · Today · Your Moment · News) |
| `/brandbook` | 단지, 기록으로 만나는 50년 |
| `/icons/{banana-milk,bravo,samanco,yoplait}` | 제품별 상세 |
| `/branding/` | 별도로 추가한 빙그레 브랜드 스토리 페이지 |
| `/banana-milk/` | 별도로 추가한 바나나맛우유 페이지 |
| `/banana-milk/bravo/` | 바나나맛우유에서 연결되는 부라보콘 페이지 |

## 추가 페이지 작업 안내

기존 메인, `/brandbook`, `/icons/banana-milk`는 변경하지 않았습니다.
새로운 브랜드 페이지 작업은 `branding/`, 바나나맛우유 작업은 `banana-milk/`에서 진행합니다.
각 폴더에는 HTML, CSS, JavaScript와 필요한 이미지가 함께 들어 있습니다.
기존 Nuxt 번들과 독립된 HTML 페이지이므로 기존 앱에서 연결할 때는
`<a href="/branding/">브랜드 이야기</a>`, `<a href="/banana-milk/">바나나맛우유</a>`처럼
일반 링크로 이동하세요. 생성된 Nuxt 번들에 라우트를 직접 추가할 필요가 없습니다.
상세 인계 사항은 `PAGE-HANDOFF.md`를 참고하세요.

## 구조

```
index.html              # 메인 페이지 (SSR 결과 + __NUXT_DATA__)
brandbook/, icons/      # 하위 페이지
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
