# 🚀 sharklink - 빠른 시작 가이드

## 📦 설치 및 실행 (5분)

### 1. 프로젝트 압축 해제

```bash
# 다운로드한 파일 압축 해제
tar -xzf sharklink-mvp.tar.gz
cd sharklink-mvp
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.local.example .env.local

# 파일 편집
code .env.local
```

**필수 입력 값:**

```env
# 1. NextAuth Secret (랜덤 문자열 생성)
# 터미널에서: openssl rand -base64 32
NEXTAUTH_SECRET=여기에_생성된_랜덤_문자열_붙여넣기

# 2. Google OAuth (아래 설정 가이드 참고)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# 3. Upstash Redis (아래 설정 가이드 참고)
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=AXXXxxx
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 브라우저 접속

```
http://localhost:3000
```

---

## 🔑 API 키 발급 가이드

### Google Cloud Console (10분)

#### Step 1: 프로젝트 생성
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성: `sharklink-dev`

#### Step 2: API 활성화
1. "API 및 서비스" → "라이브러리"
2. "Google Drive API" 검색 → 사용 설정

#### Step 3: OAuth 동의 화면
1. "API 및 서비스" → "OAuth 동의 화면"
2. User Type: "외부" 선택
3. 앱 정보 입력:
   - 앱 이름: sharklink
   - 이메일: 본인 Gmail
4. 범위 추가:
   - `auth/userinfo.email`
   - `auth/userinfo.profile`
   - `auth/drive.readonly`
5. 테스트 사용자에 본인 Gmail 추가

#### Step 4: OAuth 2.0 클라이언트 ID
1. "사용자 인증 정보" → "+ 사용자 인증 정보 만들기"
2. "OAuth 클라이언트 ID" 선택
3. 애플리케이션 유형: "웹 애플리케이션"
4. 승인된 리디렉션 URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. 생성된 Client ID와 Secret 복사 → `.env.local`에 붙여넣기

---

### Upstash Redis (5분)

#### Option 1: Upstash Console
1. https://console.upstash.com 접속
2. GitHub/Google로 로그인
3. "Create Database" 클릭
   - Name: `sharklink-dev`
   - Region: Seoul (또는 가까운 지역)
4. 생성 후 환경 변수 복사:
   ```
   UPSTASH_REDIS_REST_URL
   UPSTASH_REDIS_REST_TOKEN
   ```
5. `.env.local`에 붙여넣기 (변수명 변경):
   ```env
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=AXXXxxx...
   ```

#### Option 2: 기존 emember Redis 사용
- emember 프로젝트의 Redis 환경 변수 그대로 사용 가능

---

## ✅ 확인 체크리스트

설치 완료 후 확인:

- [ ] `npm install` 성공
- [ ] `.env.local` 파일에 모든 값 입력
- [ ] `npm run dev` 실행
- [ ] http://localhost:3000 접속 성공
- [ ] "Google로 시작하기" 버튼 표시
- [ ] Google 로그인 성공
- [ ] 대시보드 페이지 표시

---

## 🧪 테스트 플로우

### 1. 로그인
```
http://localhost:3000
→ "Google로 시작하기" 클릭
→ Google 계정 선택
→ 권한 승인
→ 대시보드로 리다이렉트
```

### 2. 링크 생성
```
대시보드
→ "새 링크 만들기" 클릭
→ Google Drive 파일 선택
→ "링크 생성" 클릭
→ 공유 링크 복사
```

### 3. 추적 확인
```
생성된 링크를 시크릿 모드로 열기
→ 파일 뷰어 표시
→ 대시보드에서 실시간 로그 확인
→ IP, 위치, 디바이스 정보 확인
```

---

## 📂 프로젝트 구조

```
sharklink-mvp/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth
│   │   ├── links/               # 링크 관리
│   │   └── view/                # 추적
│   ├── dashboard/               # 대시보드 (생성 예정)
│   ├── v/[linkId]/             # 뷰어 페이지 (생성 예정)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── redis.ts                 # Redis 클라이언트
│   ├── google-drive.ts          # Drive API
│   └── geolocation.ts           # IP → 위치
├── types/
│   └── index.ts                 # TypeScript 타입
├── .env.local.example           # 환경 변수 템플릿
├── package.json
└── SETUP_GUIDE.md               # 상세 설정 가이드
```

---

## 🐛 문제 해결

### "redirect_uri_mismatch" 에러
→ Google Cloud Console에서 리디렉션 URI 정확히 입력:
```
http://localhost:3000/api/auth/callback/google
```

### Redis 연결 에러
→ `.env.local`의 Redis URL과 Token 재확인

### "Invalid session" 에러
→ `.env.local`의 `NEXTAUTH_SECRET` 생성했는지 확인

---

## 📚 다음 단계

로컬 실행 성공 후:

1. ✅ 대시보드 페이지 완성
2. ✅ 뷰어 페이지 완성
3. ✅ 분석 페이지 완성
4. ✅ Vercel 배포

---

## 💡 추가 기능 (Phase 2)

- 권한 요청 시스템
- 이메일 알림
- 링크 만료 설정
- 비밀번호 보호
- 고급 분석 (차트)

---

**문제가 있으면 SETUP_GUIDE.md를 참고하거나 질문하세요!** 🚀
