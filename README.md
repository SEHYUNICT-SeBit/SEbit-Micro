# SEbit MicroSite

세현ICT 3대 솔루션 브랜드(SEbit AI, LUMO, GeoAxis)를 소개하는 마이크로사이트입니다.

**Live Site**: https://sebit-micro.pages.dev

---

## 산출물 현황

### 1. 사이트 구조 (총 20페이지)

| URL | 페이지 | 설명 |
|-----|--------|------|
| `/` | 메인 | 히어로 + 3대 솔루션 카드 + Contact Us |
| `/brand-story` | 브랜드 스토리 | 기업 소개, 비전, 파트너 현황 |
| **SEbit AI** | | |
| `/sebitai` | AI 개요 | sLLM, Context Engineering, 도입 효과 |
| `/sebitai/agen-d` | Agen-D | 3D/2D 설계 데이터 AI 자율 변환 |
| `/sebitai/agen-sight` | Agen-Sight | 인간+객체 복합 감지 산업안전 AI |
| `/sebitai/agen-talk` | Agen-Talk | 기업 지식 기반 RAG 대화 에이전트 |
| `/sebitai/usecase` | Use Case | AI 솔루션 도입 사례 |
| **LUMO** | | |
| `/lumo` | LUMO 개요 | 차세대 모바일 통합 플랫폼 |
| `/lumo/mobile` | LUMO Mobile | 하이브리드 앱 개발 플랫폼 |
| `/lumo/push` | LUMO Push | 웹 푸시 알림 서비스 |
| **GeoAxis** | | |
| `/geoaxis` | GeoAxis 개요 | 통합 공간정보 플랫폼 |
| `/geoaxis/2d-gis` | 2D GIS Engine | HTML5 Canvas 기반 2D GIS |
| `/geoaxis/3d-gis` | 3D GIS Engine | WebGL 기반 3D GIS |
| `/geoaxis/cad-view` | CAD View | 웹 기반 CAD 도면 뷰어 |
| `/geoaxis/cad-compare` | CAD Compare | 도면 비교 분석 |
| `/geoaxis/layout-manager` | Layout Manager | 공간 배치 관리 |
| `/geoaxis/xler` | Xler | 변환 엔진 |
| `/geoaxis/ar` | AR | AR 시각화 |
| `/geoaxis/rmcp` | RMCP | 원격 협업 플랫폼 |

### 2. 기술 스택

| 구분 | 기술 | 설명 |
|------|------|------|
| Frontend | HTML / CSS / JS | 프레임워크 없는 정적 사이트 |
| API | Hono + Cloudflare Workers | AI 챗봇 백엔드 |
| AI 모델 | Cloudflare Workers AI | Llama 3.1 8B (무료 Tier) |
| 호스팅 | Cloudflare Pages | master push 시 자동 배포 |
| 폼 전송 | FormSubmit.co | AJAX 이메일 발송 |
| 아이콘 | xeicon | 한국형 아이콘 라이브러리 |

### 3. 프로젝트 디렉토리 구조

```
SEbit Micro/
├── index.html                # 메인 페이지
├── _redirects                # Cloudflare Pages 리다이렉트 규칙
├── brand-story/
│   └── index.html
├── sebitai/
│   ├── index.html            # AI 개요
│   ├── agen-d/index.html
│   ├── agen-sight/index.html
│   ├── agen-talk/index.html
│   └── usecase/index.html
├── lumo/
│   ├── index.html            # LUMO 개요
│   ├── mobile/index.html
│   └── push/index.html
├── geoaxis/
│   ├── index.html            # GeoAxis 개요
│   ├── 2d-gis/index.html
│   ├── 3d-gis/index.html
│   ├── cad-view/index.html
│   ├── cad-compare/index.html
│   ├── layout-manager/index.html
│   ├── xler/index.html
│   ├── ar/index.html
│   └── rmcp/index.html
├── css/
│   ├── commons.css           # 리셋 + 공통 스타일
│   ├── styles.css            # 메인 스타일 + 반응형
│   └── chatbot.css           # 챗봇 전용 스타일
├── js/
│   ├── main.js               # 탭, 스크롤, 폼 검증, Top 버튼
│   └── chatbot.js            # Agen-Talk 챗봇 (SSE 스트리밍)
├── img/                      # 이미지 리소스
├── api/                      # Hono API Worker
│   ├── src/
│   │   ├── index.ts          # 라우터, CORS, SSE 스트리밍
│   │   └── prompt.ts         # 시스템 프롬프트 (솔루션 정보)
│   ├── wrangler.toml         # Workers 설정
│   └── package.json
├── docs/
│   └── 02-design/
│       └── site-design-spec.md  # 설계 명세서 (49개 요구사항)
└── sebit_v02/                # 레거시 백업 (배포 불필요)
```

### 4. 주요 기능

#### 4.1 Agen-Talk AI 챗봇
- 우하단 FAB 버튼 (🤖 Agen-Talk)
- Cloudflare Workers AI 기반 SSE 스트리밍 응답
- 세션당 최대 30개 메시지 제한
- 랜덤 추천 질문 칩 (10개 풀에서 3개)
- "상세 문의하기" 배지 → Contact Us 섹션 스크롤 이동
- sessionStorage 기반 대화 이력 유지

#### 4.2 Contact Us 폼
- 6개 필수 필드 (문의유형, 회사명, 이름, 이메일, 전화, 내용)
- 개인정보 수집 동의 체크박스
- FormSubmit.co AJAX 전송 (hjkim@sehyunict.com)
- 전송 상태 피드백 (성공/실패 알림)

#### 4.3 반응형 디자인
- 768px: 모바일 네비게이션, 그리드 2열 축소
- 480px: 카드 1열, 파트너 로고 2열
- CSS 속성 선택자로 inline grid style override

#### 4.4 URL 리다이렉트
- legacy `sub*.html` → clean URL (301 영구 리다이렉트)
- `/ai/*` → `/sebitai/*` (이전 URL 호환)

### 5. 배포

#### 웹사이트 (자동)
master 브랜치에 push하면 Cloudflare Pages가 자동 배포합니다.

#### API (수동)
```bash
cd api
npx wrangler deploy
```

### 6. 개발 이력

| 날짜 | 작업 | 커밋 |
|------|------|------|
| 2026-02-19 | 1단계: 정적 페이지 품질 개선 | `ec48d07` |
| 2026-02-19 | SEbit AI 페이지 전면 개편 | `273240a` |
| 2026-02-19 | AI 챗봇 연동 (Workers AI) | `1cdd1d5` |
| 2026-02-19 | Contact Us 메일 발송 연동 | `fdde3c3` |
| 2026-02-19 | Draft AI → Agen-D 리브랜딩 | `fd99c67` |
| 2026-02-19 | Safety AI → Agen-Sight 리브랜딩 | `560f556` |
| 2026-02-19 | Chatbot AI → Agen-Talk 리브랜딩 | `8fd0454` |
| 2026-02-19 | LUMO 보강 + GeoAxis 서브페이지 추가 | `6987fa2` ~ `30e04f8` |
| 2026-02-19 | 챗봇 Agen-Talk 브랜딩 + FAB 개선 | `1392d3a` ~ `22fa722` |
| 2026-02-20 | Clean URL 구조 전환 | `676b293` |
| 2026-02-20 | /ai → /sebitai URL 리브랜딩 | `d97d9d1` |
| 2026-02-20 | GeoAxis 개요 페이지 생성 | `b28917b` |
| 2026-02-20 | 메인 페이지 키워드 업데이트 | `f0af017` |
| 2026-02-20 | 풀 사이트 감사 + 버그 수정 | `73a3224` |
| 2026-02-20 | PDCA Gap 분석 → 4건 수정 | `d51ac11` |

### 7. PDCA 품질 관리

| 단계 | 내용 | 상태 |
|------|------|:----:|
| **Plan** | 요구사항 정의 (49개 REQ) | ✅ |
| **Do** | 20페이지 + API + 챗봇 구현 | ✅ |
| **Check** | Gap 분석 (3개 에이전트 병렬 검증) | ✅ 98% |
| **Act** | FAIL 4건 수정 (네비/브랜딩/favicon/리다이렉트) | ✅ |

설계 명세서: [`docs/02-design/site-design-spec.md`](docs/02-design/site-design-spec.md)

### 8. 환경 설정

#### API 환경 변수 (wrangler.toml)
```toml
ALLOWED_ORIGINS = "https://sebit-micro.pages.dev,http://localhost:3200"
```

#### 로컬 개발
```bash
# 웹사이트 (정적 파일 서버)
npx serve .

# API
cd api
cp .dev.vars.example .dev.vars  # 환경변수 설정
npx wrangler dev
```

---

## 라이선스

Copyright (c) 2026 SEHYUNICT SEbit. All rights reserved.
