# 🌍 TourForChild — 아이와 떠나는 여행 이야기

여행 가기 **전에** 부모와 아이가 함께 읽는, 도시별 "이런 사실도 있었어?" 여행 이야기 사이트.
폼페이는 왜 사라졌을까? 경주는 왜 천년의 수도일까? — 무겁지 않고 재미있게.

- **DB 없음 / 순수 프론트엔드 정적 사이트** — 서버 없이 어디서나 동작
- **4개국어** 한국어 · English · 日本語 · 中文 (상단에서 전환)
- **모바일 최적화**, 도시 검색 + 대륙/나라 네비게이션
- **지도 연동** (Leaflet + OpenStreetMap, API 키 불필요)
- **검색엔진/AI 최적화** — 도시별 정적 HTML · JSON-LD · hreflang · sitemap
- 정보 수정 요청: **hoonjeong.eden@gmail.com**

## 📁 구조

```
index.html          메인 SPA (그냥 열어도 동작 — file:// 가능)
styles.css          스타일 (모바일 우선)
i18n.js             UI 문구 4개국어
app.js              SPA 로직 (라우팅 · 검색 · 지도 · 언어)
data/
  _master.json      ★ 도시 큐레이션 목록 (국가 4개국어명 · 국기 · 대륙 · 도시 seed)
  raw/<id>.json     ★ 도시별 콘텐츠 원본 (사람이 수정하는 곳)
  index.js          (자동생성) 네비/검색용 인덱스
  cities/<code>.js  (자동생성) 나라별 콘텐츠 (필요할 때만 로드)
c/<lang>/<id>.html  (자동생성) SEO용 정적 페이지
sitemap.xml, robots.txt  (자동생성)
build.js            빌드: raw → index/cities + SEO 페이지 + sitemap
validate.js         raw 콘텐츠 스키마 검증
```

## ✏️ 콘텐츠 추가/수정하는 법

1. **도시 추가**: `data/_master.json`의 `cities`에 한 줄 추가
   ```json
   { "id": "hanoi", "country": "vn", "en": "Hanoi", "emoji": "🏮" }
   ```
   (새 나라면 `countries`에도 국가 4개국어명 + 국기 + 대륙 추가)
2. **콘텐츠 작성**: `data/raw/<id>.json` 생성 (형식은 `data/raw/pompeii.json` 참고)
3. **검증 & 빌드**:
   ```bash
   node validate.js     # 스키마 체크
   node build.js        # 데이터/SEO 페이지/sitemap 재생성
   ```

> 콘텐츠를 고쳐도 **build.js를 다시 돌려야** 사이트에 반영됩니다.

## 🚀 실행 / 배포

- **로컬 확인**: `index.html`을 브라우저로 열기 (지도는 인터넷 필요).
  로컬 서버 권장: `npx serve` 또는 `python -m http.server`
- **배포**: 폴더 전체를 정적 호스팅(GitHub Pages, Netlify, Vercel, S3 등)에 업로드.
  배포 도메인이 정해지면 sitemap URL이 맞도록:
  ```bash
  TFC_ORIGIN="https://내도메인" node build.js
  ```

## 🧩 콘텐츠 스키마 (`data/raw/<id>.json`)

```jsonc
{
  "id": "pompeii",
  "country": "it",
  "coords": [40.7497, 14.4869],
  "name":    { "ko": "...", "en": "...", "ja": "...", "zh": "..." },
  "tagline": { "ko": "...", ... },       // 한 줄 캐치프레이즈
  "intro":   { "ko": "...", ... },       // 2~4문장 훅
  "funFacts": {                          // 언어별 4~5개 (개수 동일)
    "ko": ["...", "..."], "en": [...], "ja": [...], "zh": [...]
  },
  "kidQuestion": { "ko": "...", ... },   // 아이에게 던지는 질문
  "places": [                            // 이야기와 연결된 장소 3곳
    { "name": {4개국어}, "blurb": {4개국어}, "coords": [lat, lng] }
  ]
}
```

콘텐츠 톤: **가볍고 재미있게**, 전문적/장황하지 않게. 가족여행 인기 도시 위주.
