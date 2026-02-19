# SEbit MicroSite - CLAUDE.md

## 프로젝트 개요
- **프로젝트**: 세현ICT(SEHYUNICT) SEbit 브랜드 마이크로사이트
- **GitHub**: https://github.com/SEHYUNICT-SeBit/SEbit-Micro.git
- **목적**: 세현ICT의 3대 솔루션(SEbit AI, LUMO, GeoAxis) 소개 + AI 챗봇 상담

## 배포 환경

| 항목 | URL | 플랫폼 |
|------|-----|--------|
| 정적사이트 | https://sebit-micro-web.pages.dev | Cloudflare Pages (git push 자동배포) |
| API Worker | https://sebit-micro-api.sh1stzfold7.workers.dev | Cloudflare Workers |

- **브랜치**: `master` (push하면 Cloudflare Pages 자동 배포)
- **API 배포**: `cd api && npx wrangler deploy`

## 기술 스택

### 정적사이트 (sebit_v02/)
- **순수 HTML/CSS/JS** - 프레임워크 없음 (No React, No Next.js, No build tool)
- HTML 페이지 10개 (index.html + sub 9개)
- CSS: commons.css, styles.css, chatbot.css, xeicon (아이콘)
- JS: main.js (공통 UI), chatbot.js (AI 챗봇 위젯, IIFE)

### API 백엔드 (api/)
- **Hono** (Cloudflare Workers용 경량 프레임워크)
- **Cloudflare Workers AI** (무료 AI 모델)
- TypeScript, wrangler
- 모델: `@cf/meta/llama-3.1-8b-instruct-fp8`

## 프로젝트 구조

```
SEbit Micro/
├── CLAUDE.md                    ← 이 파일
├── .gitignore
├── api/                         ← Hono Workers API
│   ├── src/
│   │   ├── index.ts             ← API 엔드포인트 (/api/chat, /api/health)
│   │   └── prompt.ts            ← System Prompt (회사 전체 정보)
│   ├── wrangler.toml            ← Workers 설정 + AI binding
│   ├── package.json
│   └── tsconfig.json
├── sebit_v02/                   ← 정적 사이트
│   ├── index.html               ← 메인 페이지
│   ├── sub.html                 ← Brand Story
│   ├── sub01.html               ← SEbit LUMO 메인
│   ├── sub02.html               ← SEbit AI 메인
│   ├── sub02_01.html            ← Safety AI
│   ├── sub02_02.html            ← Draft AI
│   ├── sub02_03.html            ← Chatbot AI
│   ├── sub02_04.html            ← SEbit AI 상세
│   ├── sub03.html               ← LUMO Mobile
│   ├── sub03_01.html            ← LUMO Push
│   ├── css/
│   │   ├── commons.css          ← 리셋/공통
│   │   ├── styles.css           ← 메인 스타일
│   │   ├── chatbot.css          ← 챗봇 위젯 스타일
│   │   └── xeicon.min.css       ← 아이콘 폰트
│   ├── js/
│   │   ├── main.js              ← 공통 JS (reveal, 탭, 스크롤)
│   │   └── chatbot.js           ← AI 챗봇 위젯 (IIFE)
│   └── img/                     ← 이미지 리소스
```

---

## 절대 규칙 (MUST)

### 1. 비용 규칙 - 무료만 사용
- **유료 API 절대 금지**: Anthropic API, OpenAI API 등 유료 서비스 사용 금지
- **Cloudflare Workers AI만 사용**: 무료 티어, AI binding으로 접근
- API 키가 필요한 외부 AI 서비스를 제안하지 말 것
- 비용이 발생하는 서비스를 도입할 때는 반드시 사전에 사용자에게 고지하고 승인받을 것

### 2. 기술 스택 유지
- **정적사이트는 순수 HTML/CSS/JS 유지** - React, Next.js, Vue 등 프레임워크 도입 금지
- **빌드 도구 없음** - webpack, vite, rollup 등 도입 금지
- **API는 Hono + Cloudflare Workers** 유지
- 새로운 라이브러리/프레임워크 도입 시 반드시 사전 확인

### 3. 파일 작업 규칙
- **Read 먼저, Edit 나중**: 파일을 수정하기 전에 반드시 먼저 Read로 읽을 것
- **HTML 수정 시 전체 10페이지 일관성 확인**: 하나를 바꾸면 나머지도 동일하게 변경
- **backup 파일 건드리지 않기**: *_backup.html 파일은 수정/삭제하지 말 것

### 4. TypeScript 타입 규칙
- **타입을 추측하지 말 것**: @cloudflare/workers-types에서 실제 타입 확인 후 사용
- **tsc --noEmit로 반드시 검증**: 코드 작성 후 TypeScript 컴파일 에러 확인
- Workers AI 모델명은 타입 정의에 있는 것만 사용 (예: `@cf/meta/llama-3.1-8b-instruct-fp8`)

### 5. 배포 규칙
- **API 변경 시**: `cd api && npx wrangler deploy`로 Workers 재배포
- **정적사이트 변경 시**: git push → Cloudflare Pages 자동 배포
- **chatbot.js의 apiUrl은 프로덕션 URL 유지**: `https://sebit-micro-api.sh1stzfold7.workers.dev/api/chat`
- wrangler.toml의 ALLOWED_ORIGINS에 새 도메인 추가 시 재배포 필요

### 6. 커밋 규칙
- 커밋 메시지 한국어 사용 가능
- prefix: feat, fix, refactor, style, docs
- `.bkit/`, `docs/.pdca-snapshots/`는 커밋에 포함하지 않기

---

## 코딩 컨벤션

### HTML
- lang="ko" 유지
- 모든 페이지에 동일한 header/nav/footer 구조
- chatbot 포함: `<link chatbot.css>` + `<script chatbot.js defer>` (xeicon 다음에)
- 접근성: aria-label, alt 속성 필수

### CSS
- 기존 스타일 톤 유지 (다크 배경 #0a1024, 액센트 블루 #48c5ff)
- BEM 네이밍 아님 - 기존 클래스명 규칙 따르기
- 모바일 반응형: 768px 기준

### JavaScript
- ES5 호환 (chatbot.js) - var 사용, 화살표 함수 금지
- main.js - DOMContentLoaded 패턴
- chatbot.js - IIFE 패턴, 전역 변수 오염 방지

### TypeScript (API)
- strict 모드
- Hono 타입: `Hono<{ Bindings: Bindings }>`
- Workers AI 타입: `@cloudflare/workers-types`에서 제공

---

## 챗봇 아키텍처

```
[브라우저 chatbot.js] ──SSE──> [Workers API /api/chat] ──AI binding──> [Workers AI (무료)]
                                      │
                                 prompt.ts (System Prompt)
                                 CORS + Rate Limit
```

- **System Prompt Engineering**: RAG 없이 prompt.ts에 회사 전체 정보 포함
- **SSE 스트리밍**: Workers AI → TransformStream → 프론트엔드 실시간 표시
- **세션 관리**: sessionStorage (페이지 이동 간 대화 유지, 브라우저 닫으면 초기화)
- **Rate Limit**: 서버 10req/min, 클라이언트 2초 쿨다운 + 세션당 30메시지

---

## 주의사항

- **wrangler.toml에 시크릿 넣지 말 것** - 환경변수만 [vars]에
- **api/.dev.vars는 git에 포함되지 않음** (.gitignore)
- **api/node_modules/는 git에 포함되지 않음** (.gitignore)
- System Prompt(prompt.ts) 수정 시 Workers 재배포 필요
- Llama 모델은 Claude보다 한국어 품질이 낮을 수 있음 - 프롬프트를 명확하고 구체적으로 작성
