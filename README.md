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
