# 화성FC 스코어 예측 이벤트
> 화성FC 경기 스코어를 예측하고 경품을 받아가는 이벤트 참여 사이트

<br/>

**🔗 배포 URL**
<br/>

[https://hwaseongfc-e8890.web.app/](https://hwaseongfc-e8890.web.app/)
<br/>
<br/>


**👩‍💻 개발 기간 및 정보**
> 2026.02 - 현재, <br />
클라이언트 요구사항 분석 및 기획서 작성부터 배포·운영까지의 과정 담당


<br />

**💡 주요 기능**
- 경기 스코어 예측 제출 (이름/전화번호 입력, 경기당 1회)
- 참여 시간 제한 (경기 시작 2시간 전 오픈 / 5분 전 마감)
- 관리자: 경기별 참여자 조회 및 엑셀 내보내기
- 관리자: 경기 결과 입력 및 정답자 추출

<br />

## 화면 소개



| 진행 예정 경기 | 진행 중인 경기 | 모든 경기 마감 |
|---|---|---|
| <img  width="878" height="1422" alt="image" src="https://github.com/user-attachments/assets/cea6e92f-2fc7-4e55-b083-3eb434093d00" /> |![화면 기록 2026-03-13 오후 8 15 15](https://github.com/user-attachments/assets/54b207fc-8d39-4193-87e8-86307d93f4e5) | <img width="878" height="1422" alt="image" src="https://github.com/user-attachments/assets/b3953b95-0d93-4ba6-9a4b-48fd48855c3f" />|

<br />

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React, TypeScript, CRA + craco |
| 인증 | Firebase Authentication (Google 로그인, 관리자 전용) |
| 데이터베이스 | Firebase Firestore |
| 배포 | Firebase Hosting |
| 테스트 | Jest, Cypress |

<br />

## 주요 기술 결정

**중복 제출 방지**

> `${gameId}_${rawPhone}` 형태를 문서 ID로 설정해 한 게임에 같은 전화번호로 중복 제출을 하지 못하도록 했습니다.

<br />

**서버 시간 동기화**

> 참여 마감 시간을 클라이언트 시간 기준으로 처리하면 기기 시간을 변경해 마감을 우회할 수 있습니다. Firebase `serverTimestamp`로 서버 시간을 가져온 뒤 클라이언트 시간과의 offset을 계산해 `ServerTimeContext`로 전역 관리합니다. 시간 판단이 필요한 모든 로직은 이 offset을 기준으로 동작합니다.

```typescript
// 앱 초기화 시 서버 시간과 클라이언트 시간의 차이를 계산
getServerTime().then((serverTime) => {
  setOffset(serverTime.getTime() - Date.now());
});

// 시간 계산 함수의 외부에서 now를 주입
getTimeLeft(closeTime, Date.now() + offset)
getDDayDisplay(openDate, Date.now() + offset)
```

<br />

**테스트 환경 구성**

> 예측 제출 플로우는 Firestore 읽기/쓰기, 중복 체크, 서버 시간 확인 등 여러 단계가 연결되어 있어 단위 테스트만으로는 전체 흐름을 검증하기 어렵다고 판단해 E2E 테스트를 작성했습니다.<br /><br />
Firebase Emulator로 실제 Firestore와 격리된 테스트 환경을 구성했습니다. `REACT_APP_USE_EMULATOR` 환경변수로 에뮬레이터 연결 여부를 제어하고, Cypress `cy.task`와 firebase-admin SDK를 통해 테스트 전 Firestore에 테스트용 경기 데이터를 직접 심는 방식으로 E2E 테스트를 구성했습니다.

<br />

**시간 계산 함수 순수 함수로 개선**

> 초기 구현에서 `getTimeLeft`는 내부에서 `new Date()`를 직접 호출하고 있었고, `getDDayDisplay`는 `Date.now()`를 직접 호출하고 있었습니다. 두 함수 모두 같은 입력에도 호출 시각에 따라 다른 결과를 반환하는 구조였습니다. 테스트 작성 과정에서 이 문제를 발견하고 `now: number`를 매개변수로 주입받는 방식으로 통일했습니다. 이 과정에서 `getTimeLeft`에 서버 시간 offset이 적용되지 않던 버그도 함께 수정했습니다.

<br />

**Lighthouse 성능 개선**

> Black Han Sans 폰트를 Google Fonts 대신 로컬 폰트로 전환했고, Noto Sans KR은 한글 유니코드 범위별 subsetting 구조상 로컬 호스팅 시 오히려 번들 크기가 증가할 수 있어 Google Fonts를 유지했습니다. 또한 서버 시간 offset 계산 전까지 로딩 스피너를 보여주던 방식에서 offset 초기값을 0으로 설정해 콘텐츠를 즉시 렌더링하도록 변경했습니다.<br/>


| 지표 | 개선 전 | 개선 후 |
|:------:|:---------:|:---------:|
| Performance | 61 | 69 |
| FCP | 5.0s | 3.9s |
| LCP | 7.1s | 5.7s |
