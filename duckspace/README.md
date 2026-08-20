# DuckSpace

내 최애 굿즈를 3D 장식장에 전시하고, 팝업스토어 정보를 확인하고, 다른 덕후들과 교환/잡담을 나누는 덕질 공간 서비스입니다.

- 배포: https://duck-space-frontend.vercel.app

## 팀 구성

| 역할 | 담당 |
| --- | --- |
| 기획 | 기디 |
| 프론트엔드 | 조민서, 안정규 |
| 백엔드 | 송승환, 현준, 윤혁 |

## 기술 스택

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- Zustand (전역 상태 관리)
- Axios
- Konva / react-konva (장식장 드래그 앤 드롭 편집)

## 주요 기능

- **홈** — 배너 슬라이드, 다가오는 팝업, 다른 유저 전시장 미리보기
- **장식장(전시장)** — 보유 굿즈를 3D 장식장에 배치하고 꾸미기
- **팝업** — 팝업스토어 일정 조회, 위시리스트(찜)
- **덕톡라운지** — 잡담/교환 게시판, 1:1 채팅
- **교환** — 교환 글 작성/신청/수락/거절/완료, 교환목록(보낸 신청/받은 신청/진행중/완료) 관리
- **검색** — 전시장/유저 검색
- **인증** — 로그인/회원가입

## 폴더 구조

```
src/
├── apis/                 # 백엔드 API 호출 (도메인별 파일 분리)
├── assets/                # 이미지, 아이콘
├── components/
│   ├── common/            # Avatar, NavBar, LoginRoute 등 전역 공용 컴포넌트
│   ├── chatComponents/     # 채팅 관련
│   ├── displayComponents/  # 장식장/전시장 관련
│   ├── duckTalkComponents/ # 덕톡(잡담/교환) 관련
│   └── homeComponents/     # 홈 화면 전용
├── data/                  # 목업/정적 데이터
├── pages/
│   ├── authPage/           # 로그인, 회원가입
│   ├── homePage/           # 홈
│   ├── searchPage/         # 검색
│   ├── chatPage/           # 채팅 목록/채팅방
│   ├── displayPage/        # 장식장 상세/목록/굿즈 업로드
│   ├── popupPage/          # 팝업 일정/상세/위시리스트
│   ├── duckTalkPage/        # 덕톡라운지, 마이페이지, 게시글 작성
│   └── exchangePage/        # 교환 신청/상세/목록
├── store/                 # zustand 스토어
├── App.jsx                # 라우트 정의
└── main.jsx
```

각 `pages/*Page`, `components/*Components` 폴더는 기능 단위로 묶여 있으며, 여러 기능에서 공용으로 쓰는 컴포넌트만 `components/common`에 둡니다.

## 시작하기

### 요구사항

- Node.js 18+

### 설치

```bash
npm install
```

### 로컬 실행

```bash
npm run dev
```

`http://localhost:3030` 에서 확인할 수 있습니다 (포트는 `vite.config.js`에 고정).

### 빌드

```bash
npm run build
```

### 린트

```bash
npm run lint
```

## 배포

`main` 브랜치에 push되면 Vercel이 자동 배포합니다.
