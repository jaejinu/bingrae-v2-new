# 추가 페이지 인계

## 목적

기존 사이트를 유지하면서, 이전에 완성한 빙그레 브랜드 페이지와 바나나맛우유 페이지를 별도 경로에 추가했습니다.

## 작업 위치

- 브랜드: `branding/index.html`, `branding/style.css`, `branding/script.js`, `branding/assets/`
- 바나나맛우유: `banana-milk/index.html`, `banana-milk/banana.css`, `banana-milk/base.css`, `banana-milk/banana.js`, `banana-milk/assets/`
- 연결된 부라보콘: `banana-milk/bravo/` (원래의 내부 연결 유지)

## 후속 작업 범위

- 새 브랜딩 화면은 `branding/`에서 작업합니다.
- 기존 루트 `index.html`, `brandbook/`, `icons/`, `_nuxt/`, `_startup-fixed/`는 이번 추가 작업에서 수정하지 않았습니다.
- 기존 데스크톱·모바일 메뉴에는 `enhancements/page-links.js`가 브랜드·바나나맛우유 링크를 추가합니다. 기존 바나나맛우유 상세 링크도 새 페이지로 연결합니다.
- 새 페이지는 독립 문서이므로 Nuxt 클라이언트 라우터 대신 전체 문서 이동을 사용합니다.
- 이미지 상대 경로가 유지되도록 각 폴더 전체를 함께 배포합니다.
- `.vercel`, `.openai`, 인증 정보, 이전 프로젝트의 Git 정보는 가져오지 않았습니다.

## 확인

저장소 루트를 정적 서버로 실행한 뒤 `/branding/`, `/banana-milk/`, `/banana-milk/bravo/`를 확인하세요.
별도 설치나 빌드 없이 제공합니다. 원본 디자인과 모바일 스타일을 그대로 유지했습니다.

## 출처 및 공개

브랜드 페이지의 생활 사진은 AI 연출 이미지입니다. 각 페이지의 디자인 시안 표시와 공식 정보 출처를 유지하세요.
메뉴 연결 스크립트는 기존 HTML에서 불러오며, 원본 Nuxt 번들은 수정하지 않습니다. GitHub main 푸시 시 기존 Vercel 자동 배포 설정을 사용합니다.
