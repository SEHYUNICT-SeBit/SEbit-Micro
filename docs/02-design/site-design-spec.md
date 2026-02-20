# SEbit MicroSite 설계 명세서

## 1. 프로젝트 개요
- **목적**: 세현ICT의 3대 솔루션 브랜드(SEbit AI, LUMO, GeoAxis)를 소개하는 마이크로사이트
- **타입**: 정적 HTML/CSS/JS (서버 렌더링 없음)
- **호스팅**: Cloudflare Pages (자동 배포, master 브랜치)
- **API**: Hono on Cloudflare Workers (챗봇용)
- **도메인**: sebit-micro.pages.dev

## 2. URL 구조 (Clean URL)

### 2.1 페이지 목록 (총 20개)
| URL | 설명 | 파일 |
|-----|------|------|
| `/` | 메인 페이지 (3대 솔루션 개요 카드) | `index.html` |
| `/brand-story` | 브랜드 스토리 (기업 소개) | `brand-story/index.html` |
| `/sebitai` | SEbit AI 개요 | `sebitai/index.html` |
| `/sebitai/agen-d` | Agen-D (3D/2D 설계 변환) | `sebitai/agen-d/index.html` |
| `/sebitai/agen-sight` | Agen-Sight (산업안전 AI) | `sebitai/agen-sight/index.html` |
| `/sebitai/agen-talk` | Agen-Talk (RAG 챗봇) | `sebitai/agen-talk/index.html` |
| `/sebitai/usecase` | AI Use Case (도입 사례) | `sebitai/usecase/index.html` |
| `/lumo` | LUMO 개요 | `lumo/index.html` |
| `/lumo/mobile` | LUMO Mobile (하이브리드 앱 플랫폼) | `lumo/mobile/index.html` |
| `/lumo/push` | LUMO Push (웹 푸시 서비스) | `lumo/push/index.html` |
| `/geoaxis` | GeoAxis 개요 | `geoaxis/index.html` |
| `/geoaxis/2d-gis` | 2D GIS Engine | `geoaxis/2d-gis/index.html` |
| `/geoaxis/3d-gis` | 3D GIS Engine | `geoaxis/3d-gis/index.html` |
| `/geoaxis/cad-view` | CAD Web Viewer | `geoaxis/cad-view/index.html` |
| `/geoaxis/cad-compare` | CAD 도면 비교 | `geoaxis/cad-compare/index.html` |
| `/geoaxis/layout-manager` | Layout Manager | `geoaxis/layout-manager/index.html` |
| `/geoaxis/xler` | Xler (변환 엔진) | `geoaxis/xler/index.html` |
| `/geoaxis/ar` | AR 시각화 | `geoaxis/ar/index.html` |
| `/geoaxis/rmcp` | RMCP (원격 협업) | `geoaxis/rmcp/index.html` |

### 2.2 리다이렉트 (_redirects)
- 모든 legacy `sub*.html` URL → 신규 clean URL (301)
- `/ai/*` → `/sebitai/*` (301, 이전 URL 호환)

## 3. 네비게이션 구조

### 3.1 GNB (Global Navigation Bar) - 전 페이지 동일
```
Home | Brand Story | SEbit AI ▼ | LUMO ▼ | GeoAxis ▼
                     ├ Agen-D        ├ Mobile    ├ 2D GIS Engine
                     ├ Agen-Sight    └ Push      ├ 3D GIS Engine
                     ├ Agen-Talk                  ├ CAD Web Viewer
                     └ Use Case                   ├ CAD 도면비교
                                                  ├ Layout Manager
                                                  ├ Xler
                                                  ├ AR
                                                  └ RMCP
```

### 3.2 네비게이션 규칙
- 모든 페이지에서 동일한 GNB 구조
- 드롭다운 메뉴의 텍스트/링크가 전 페이지 일관
- "Draft AI" 사용 금지 → 반드시 "Agen-D"
- 링크는 root-relative (`/sebitai/agen-d`)

## 4. 페이지별 요구사항

### 4.1 메인 페이지 (/)
- [REQ-M01] 히어로 섹션: 세현ICT 소개 + 3대 솔루션 소개
- [REQ-M02] 3개 솔루션 카드 (AI, LUMO, GeoAxis) + 각 개요 페이지 링크
- [REQ-M03] 각 카드에 해당 솔루션의 핵심 해시태그 키워드
- [REQ-M04] Contact Us 폼 (FormSubmit.co → hjkim@sehyunict.com)
- [REQ-M05] 푸터 (SNS 링크 + 저작권 표시)

### 4.2 개요 페이지 (/sebitai, /lumo, /geoaxis)
- [REQ-O01] 히어로 + 소개 텍스트
- [REQ-O02] 핵심 가치/특징 카드 섹션
- [REQ-O03] 하위 솔루션 라인업 카드 (각 상세 페이지 링크)
- [REQ-O04] Contact Us 폼 + 푸터

### 4.3 상세 페이지 (각 솔루션)
- [REQ-D01] 브레드크럼 (Home > 카테고리 > 현재 페이지)
- [REQ-D02] 히어로 (솔루션명 + 슬로건)
- [REQ-D03] 기능/특징 설명 섹션
- [REQ-D04] Contact Us 폼 + 푸터

### 4.4 브랜드 스토리 (/brand-story)
- [REQ-B01] 기업 소개, 비전, 핵심 가치
- [REQ-B02] 파트너사/인증 현황
- [REQ-B03] Contact Us 폼 + 푸터

## 5. 공통 컴포넌트

### 5.1 Agen-Talk 챗봇
- [REQ-C01] FAB 버튼 (🤖 Agen-Talk) - 우하단 고정
- [REQ-C02] 클릭 시 채팅 패널 열림
- [REQ-C03] SSE 스트리밍 응답 (Hono API → Claude)
- [REQ-C04] 추천 질문 칩 (랜덤 3개)
- [REQ-C05] 세션당 최대 30개 메시지 제한
- [REQ-C06] "상세 문의하기" 배지 → Contact US로 스크롤
- [REQ-C07] 2초 후 툴팁 표시 ("Agen-Talk에게 물어보세요!")

### 5.2 Contact Us 폼
- [REQ-F01] 필수 입력: 문의유형, 회사명, 이름, 이메일, 전화번호, 문의내용
- [REQ-F02] 개인정보 동의 체크박스 필수
- [REQ-F03] FormSubmit.co AJAX 전송
- [REQ-F04] 전송 성공/실패 알림

### 5.3 푸터
- [REQ-FT01] SNS 링크 (블로그, 유튜브, 인스타그램) + alt 텍스트
- [REQ-FT02] 저작권 표시: © SEHYUN ICT
- [REQ-FT03] 회사 정보 (주소, 전화, 이메일)

### 5.4 Top 버튼
- [REQ-T01] 스크롤 1배 이상 시 표시
- [REQ-T02] 클릭 시 smooth scroll to top

## 6. 반응형 디자인

- [REQ-R01] 768px 이하: 네비 모바일 변환, 그리드 축소
- [REQ-R02] 480px 이하: 카드 1열 배치, 파트너 로고 2열
- [REQ-R03] 4열 inline grid → 768px에서 2열, 480px에서 1열
- [REQ-R04] usecase 페이지 고정 폭 → 모바일 100%

## 7. SEO / 메타

- [REQ-S01] 각 페이지 고유 `<title>` + `<meta description>`
- [REQ-S02] charset UTF-8, viewport meta
- [REQ-S03] favicon 설정

## 8. API (Hono Worker)

- [REQ-A01] POST /api/chat - 챗봇 대화 (SSE 스트리밍)
- [REQ-A02] 시스템 프롬프트에 Agen-D, Agen-Sight, Agen-Talk, LUMO, GeoAxis 정보 포함
- [REQ-A03] CORS 설정 (sebit-micro.pages.dev 허용)
- [REQ-A04] 배포: sebit-micro-api.sh1stzfold7.workers.dev

## 9. 브랜딩 규칙

- [REQ-BR01] "Draft AI" 사용 금지 → "Agen-D"로 통일
- [REQ-BR02] 솔루션명: Agen-D, Agen-Sight, Agen-Talk (하이픈 포함)
- [REQ-BR03] GeoAxis (구 GeoNexus) - 구 명칭 사용 금지
- [REQ-BR04] SmartGeoKit 접두어는 서브페이지 제목에 미사용

## 10. 레거시 정리

- [REQ-L01] sebit_v02/ 폴더는 백업용 (배포 시 제외 가능)
- [REQ-L02] 모든 sub*.html 파일 → _redirects로 대응
