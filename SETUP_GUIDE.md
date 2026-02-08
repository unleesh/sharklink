# 🔧 sharklink 로컬 개발 환경 설정 가이드

## 📋 목차
1. Google Cloud Console 설정
2. Upstash Redis 설정
3. 환경 변수 설정
4. 로컬 실행

---

## 1️⃣ Google Cloud Console 설정 (10분)

### Step 1: 프로젝트 생성

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com

2. **새 프로젝트 만들기**
   - 좌측 상단 프로젝트 선택 드롭다운 클릭
   - "새 프로젝트" 클릭
   - 프로젝트 이름: `sharklink-dev`
   - "만들기" 클릭

3. **프로젝트 선택**
   - 생성된 프로젝트 선택

---

### Step 2: API 활성화

1. **좌측 메뉴에서 "API 및 서비스" → "라이브러리"**

2. **Google Drive API 활성화**
   - 검색: "Google Drive API"
   - 클릭 → "사용 설정" 클릭

3. **Google Sheets API 활성화** (선택)
   - 검색: "Google Sheets API"
   - 클릭 → "사용 설정" 클릭

---

### Step 3: OAuth 동의 화면 구성

1. **"API 및 서비스" → "OAuth 동의 화면"**

2. **User Type 선택**
   - "외부" 선택 (개인 계정용)
   - "만들기" 클릭

3. **앱 정보 입력**
   ```
   앱 이름: sharklink Dev
   사용자 지원 이메일: your-email@gmail.com
   개발자 연락처 정보: your-email@gmail.com
   ```
   - "저장 후 계속" 클릭

4. **범위 추가**
   - "범위 추가 또는 삭제" 클릭
   - 다음 항목 선택:
     - `auth/userinfo.email`
     - `auth/userinfo.profile`
     - `auth/drive.readonly` (Drive 파일 읽기)
   - "업데이트" → "저장 후 계속"

5. **테스트 사용자 추가**
   - "ADD USERS" 클릭
   - 본인 Gmail 주소 입력
   - "추가" → "저장 후 계속"

---

### Step 4: OAuth 2.0 클라이언트 ID 생성

1. **"API 및 서비스" → "사용자 인증 정보"**

2. **"+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"**

3. **애플리케이션 유형 선택**
   - "웹 애플리케이션" 선택

4. **이름 및 URI 설정**
   ```
   이름: sharklink Web Client
   
   승인된 자바스크립트 원본:
   - http://localhost:3000
   
   승인된 리디렉션 URI:
   - http://localhost:3000/api/auth/callback/google
   ```

5. **"만들기" 클릭**

6. **클라이언트 ID와 보안 비밀 복사**
   ```
   클라이언트 ID: xxx.apps.googleusercontent.com
   클라이언트 보안 비밀: GOCSPX-xxx
   ```
   → `.env.local`에 붙여넣기

---

## 2️⃣ Upstash Redis 설정 (5분)

### Option A: Upstash Console 직접 생성

1. **Upstash 가입**
   - https://console.upstash.com
   - GitHub 또는 Google로 로그인

2. **Redis Database 생성**
   - "Create Database" 클릭
   - Name: `sharklink-dev`
   - Type: `Regional`
   - Region: `Seoul` (또는 가까운 지역)
   - "Create" 클릭

3. **환경 변수 복사**
   - Database 페이지에서:
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=AXXXxxx...
   ```
   → `.env.local`에 붙여넣기 (변수명은 KV_REST_API_URL로 변경)

### Option B: Vercel Integration (이미 emember에서 사용 중이면 생략)

1. Vercel Dashboard → Integrations → Upstash
2. 기존 Redis 사용

---

## 3️⃣ 환경 변수 설정 (2분)

### Step 1: .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일 생성:

```bash
cd sharklink
cp .env.local.example .env.local
```

### Step 2: 환경 변수 입력

`.env.local` 파일 편집:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=please-change-this-to-random-string-minimum-32-characters

# Google OAuth (위에서 복사한 값)
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here

# Upstash Redis (위에서 복사한 값)
KV_REST_API_URL=https://your-redis-url.upstash.io
KV_REST_API_TOKEN=AXXXxxx...your-token-here

# Public URL
NEXT_PUBLIC_URL=http://localhost:3000
```

### Step 3: NEXTAUTH_SECRET 생성

터미널에서:

```bash
# Mac/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

생성된 문자열을 `NEXTAUTH_SECRET`에 붙여넣기

---

## 4️⃣ 로컬 실행 (1분)

### Step 1: 패키지 설치

```bash
cd sharklink
npm install
```

### Step 2: 개발 서버 실행

```bash
npm run dev
```

### Step 3: 브라우저 접속

```
http://localhost:3000
```

### Step 4: 테스트

1. **"Google로 로그인" 클릭**
2. **Google 계정 선택**
3. **권한 승인**
4. **대시보드 확인**

---

## ✅ 체크리스트

설정 완료 확인:

- [ ] Google Cloud Console 프로젝트 생성
- [ ] Google Drive API 활성화
- [ ] OAuth 동의 화면 구성
- [ ] OAuth 2.0 클라이언트 ID 생성
- [ ] Upstash Redis 생성
- [ ] `.env.local` 파일 생성
- [ ] 모든 환경 변수 입력
- [ ] `npm install` 실행
- [ ] `npm run dev` 실행
- [ ] http://localhost:3000 접속
- [ ] Google 로그인 성공

---

## 🐛 문제 해결

### 1. "redirect_uri_mismatch" 에러

**원인:** OAuth 리디렉션 URI가 일치하지 않음

**해결:**
1. Google Cloud Console → OAuth 클라이언트 ID 설정
2. 승인된 리디렉션 URI에 정확히 추가:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

### 2. "Invalid client" 에러

**원인:** Client ID 또는 Secret이 잘못됨

**해결:**
- `.env.local`의 `GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET` 재확인
- Google Cloud Console에서 다시 복사

### 3. Redis 연결 에러

**원인:** Redis URL 또는 Token이 잘못됨

**해결:**
- Upstash Console에서 환경 변수 다시 복사
- `.env.local`의 `KV_REST_API_URL`과 `KV_REST_API_TOKEN` 재확인

### 4. "Session Provider" 에러

**원인:** NextAuth 설정 문제

**해결:**
- `.env.local`의 `NEXTAUTH_SECRET` 확인
- `NEXTAUTH_URL=http://localhost:3000` 정확히 입력

---

## 📚 추가 참고자료

- **Google Cloud Console:** https://console.cloud.google.com
- **Upstash Console:** https://console.upstash.com
- **NextAuth 문서:** https://next-auth.js.org
- **Google Drive API:** https://developers.google.com/drive/api

---

## 🎯 다음 단계

로컬 환경이 성공적으로 실행되면:

1. ✅ 파일 선택 기능 테스트
2. ✅ 링크 생성 테스트
3. ✅ 추적 기능 확인
4. ✅ 대시보드 확인

---

**문제가 있으면 Console 로그를 확인하거나 질문하세요!** 🚀
