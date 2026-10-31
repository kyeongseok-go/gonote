# 회의록 제품 레퍼런스 조사

- 조사일: 2026-11-01
- 조사 목적: gonote(서버·계정·API 키 없는 브라우저 전용 개인 회의록 PWA, 자동 음성 받아쓰기 없음) 설계를 위한 레퍼런스 수집
- 관심 축 2개
  1. **사람이 회의 중에 빠르게 받아 적는 UX**
  2. **회의록을 어떻게 구조화하고 어떻게 공유하는가**
- 조사 방법: 공개 랜딩 페이지 / 공개 도움말 문서 / 공개 템플릿 페이지만 확인. **가입·결제·무료 체험 없음. 로그인 없음. 읽기 전용.**
- 표기 규칙: 공개 문서에서 확인한 것만 사실로 적었고, 확인하지 못한 항목은 **확인 못 함**으로 남겼습니다. 제품 내부 화면은 로그인 벽 뒤라 들어가지 않았습니다.

### 이 조사의 한계 (먼저 읽어 주세요)

- 조사한 14개 중 **로그인하지 않고 제품 내부 화면을 본 제품은 0개**입니다. 모두 랜딩 페이지의 제품 스크린샷/목업, 공개 도움말, 공개 템플릿 소개 페이지에서 얻은 정보입니다.
- 특히 **단축키(키보드 shortcut)** 는 거의 모든 제품이 공개 페이지에 적지 않습니다. 아래 표에서 단축키 칸이 대부분 "확인 못 함"인 이유입니다. Notion 의 `/meet` 슬래시 명령만 공개 문서에서 확인했습니다.
- 조사 대상 중 **12개는 "자동 음성 받아쓰기"가 제품의 중심**입니다. gonote 는 받아쓰기를 하지 않으므로, 이 제품들에서 가져올 수 있는 것은 **받아쓰기 자체가 아니라 그 주변 UX**(타임스탬프 앵커, 북마크 버튼, 2단 보기, 섹션 구조, 공유 형식)입니다. 이 점을 염두에 두고 읽어 주세요.

---

## 1. 네이버 클로바노트 (CLOVA Note)

- URL: https://clovanote.naver.com/
- 실제로 본 것
  - 공개 랜딩 페이지 전체 + FAQ (영문판으로 렌더됨)
  - 네이버 클로바 공식 블로그 3편 (공개, 로그인 불필요)
    - 북마크: https://blog.naver.com/clova_ai/222278631393
    - 녹음 중 PC 메모: https://blog.naver.com/clova_ai/222278517869
    - 노트 공유: https://blog.naver.com/clova_ai/222278634257
  - 네이버웍스(기업용) 공개 가이드: https://help.worksmobile.com/ko/use-guides/clovanote/create/bookmark/
  - 고객센터 "쉬운 음성 기록 탐색 방법": https://help.naver.com/service/24269/contents/12842?lang=ko (페이지 본문 일부만 확인 — 대부분 네비게이션이었음)
  - **제품 내부(노트 편집 화면)는 로그인 벽에 막혔습니다.** 랜딩 상단이 바로 Login.

### 회의 중 입력 UX

이 조사에서 **가장 참고할 가치가 큰 제품**입니다. "녹음은 폰, 타이핑은 PC" 라는 역할 분리가 명시적으로 설계돼 있습니다.

- **빠른 한 줄 입력**: 모바일 앱에서 녹음을 시작하고 PC 웹에 접속하면 "현재 녹음 중인 노트"가 이미 생성돼 있고, **그 노트에 바로 타이핑하면 작성 시간과 함께 기록**됩니다. (출처: clova_ai 블로그 222278517869)
  - 공식 문구: "해당 노트에 메모할 내용을 바로 타이핑하면 작성 시간과 함께 기록된답니다."
  - 즉 **"입력 즉시 타임스탬프가 자동으로 붙는다"** — 사용자가 시간을 적지 않습니다.
- **실시간 메모는 PC 전용**: "실시간 메모 작성 기능은 현재 PC 버전에서만 제공되며, 모바일 앱에서는 작성된 메모를 확인하실 수 있습니다." (같은 출처)
- **북마크 = 버튼 1개**
  - 녹음 중: 앱·PC 모두에서 화면의 '북마크' 버튼을 누르면 그 순간이 찍힘. (출처: 네이버웍스 가이드, clova_ai 블로그)
  - 녹음 후: PC 는 음성 플레이어의 북마크 추가 버튼 또는 **해당 문단 우클릭**, 모바일은 **구간 길게 누르기** → 북마크 추가.
  - 북마크는 **플레이어 바 위에도 표시**되어 바로 찾아갈 수 있음. (출처: help.naver.com/service/24269/contents/12823 검색 발췌)
- **하이라이트**: 강조하고 싶은 구간을 표시. 모바일은 길게 누르기(long-press). (출처: 랜딩 "Must-Know Features", FAQ)
- **타임스탬프 역방향 이동**: "메모가 작성된 시간을 클릭하면, 해당 구간의 대화를 다시 들을 수 있습니다." (출처: 222278517869)
- **모아보기**: 노트 오른쪽 위 [모아보기] 버튼으로 **그 노트의 북마크/하이라이트/링크만 따로 모아서** 볼 수 있음. (출처: help.naver.com .../12842 검색 발췌 + 랜딩 "Focus on what's important In one place — Gather bookmarks and highlights for quick reference. You can also check links added to memos.")
- **회의 전 사전 입력**: "If you are not ready to upload a file or find it difficult to start recording, you can prepare a new note first. By noting down the **title, participants, topic** etc. in advance, you won't miss any important details." (출처: 랜딩 FAQ)
- 발언자 지정: 랜딩/FAQ 에 "참석자 지정 및 참석자별 …" 언급이 YouTube 설명에 보이지만 **공식 도움말 원문으로는 확인 못 함**. 네이버웍스판에 Speaker 기능이 있는지도 확인 못 함.
- 단축키: **확인 못 함.**

### 회의록 구조

- AI 가 자동으로 만드는 섹션(랜딩 문구 기준): **main topics(주요 주제) / next steps(다음 단계) / summaries(요약)**
  - 원문: "AI automatically organizes **main topics, next steps, and summaries**. You can control the details by editing."
- 전부 편집 가능: "You can edit everything, from voice recordings converted to text, memos you wrote, and AI-generated summaries of key topics and next steps." (FAQ)
- **액션 아이템의 담당자·기한 필드**: 별도 필드로 존재하는지 **확인 못 함**. 공개 문구는 "next steps" 까지입니다.
- 안건/논의/결정 같은 전통적 회의록 섹션 구분은 **공개 문구에 없음**.

### 출력·공유

- **링크 공유 + 비밀번호 + 유효기간**이 핵심 (출처: 222278634257)
  - 노트 화면 우측 상단 공유 버튼 → 공유 링크 생성 → 복사 또는 공유 항목 선택
  - "노트의 공유 링크는 **비밀번호와 함께** 전달되며, **유효기간은 최소 7일부터 최대 180일까지** 설정할 수 있습니다."
  - 비밀번호 입력 실패 횟수 초과 시 더 이상 접근할 수 없는 페이지로 변경
  - **다운로드 및 노트 편집은 작성자만 가능** (공유받은 사람은 읽기만)
- **부분 공유 (PC 전용)**: "전체 음성 기록 중, 공유를 원하는 **시작 시간을 지정**해 해당 부분부터의 노트를 공유" — 구간 선택 후 공유 링크 만들기의 `<시작 시간>` 버튼
- **파일 다운로드**: "You can download all recorded audio, transcripts, and even memos as files. ClovaNote supports **a variety of file formats**, allowing you to choose the format that suits you best." (FAQ) — 구체적 포맷 목록은 **확인 못 함**
- 공유받은 화면: "텍스트로 변환된 음성 기록과 **메모를** 녹음 음성과 함께 보며 들을 수 있습니다" → **공유 뷰에 메모가 함께 나감**
- 슬랙/카톡 연동: **확인 못 함** (개인용 랜딩에 없음)

### 이 제품이 일부러 안 하는 것

- **모바일에서 실시간 메모를 안 받습니다.** 모바일은 녹음·북마크 전용, 타이핑은 PC. 손이 바쁜 상황에서 폰으로 긴 메모를 치게 하지 않겠다는 선택으로 보입니다.
- 개인용과 기업용(네이버웍스 ClovaNote)을 완전히 분리하고 **데이터 자동 이전을 제공하지 않습니다.** "There is no feature to automatically transfer data between the two services." (FAQ)
- 공유받은 사람에게 **편집·다운로드 권한을 주지 않습니다.**
- 월 무료 사용 시간을 주고 **이월하지 않습니다.** "any remaining time will not carry over and will automatically expire"

---

## 2. 다글로 (daglo)

- URL: https://daglo.ai/
- 실제로 본 것: 공개 랜딩 페이지 전체(영문 토글 상태). 랜딩에 **제품 UI 를 HTML 로 재현한 인터랙티브 목업**이 있어서 버튼 라벨과 탭 이름을 그대로 읽을 수 있었습니다. **제품 내부는 로그인 벽** (Get started → /en/sign-in).

### 회의 중 입력 UX

- 랜딩 목업의 녹음 화면에 **"Add bookmark"** 버튼과 **"Cancel"** 이 나란히 있고, 그 아래 녹음 컨트롤이 `Recording 00:00:00 / ❙❙ Pause / ● Mic / ▣ Screen / Cancel / Stop` 로 표시됩니다. → **녹음 중 북마크 버튼 1개** 구조.
- 녹음 시작 전 설정 패널: `Transcription settings — Language / Speaker diarization / My vocabulary`
  - **My vocabulary** = 사용자 사전. 클로바노트가 "메모에서 단어를 뽑아 인식 정확도를 높이는" 것과 같은 목적을 **명시적 사전 입력**으로 처리.
- **발언자 지정**: "Speaker ID is now available" 신기능 배너 + `Speaker diarization` 토글. 목업에서 `AIParticipant1 → Jake` 처럼 **AI 가 붙인 Participant 라벨을 실제 이름으로 바꿔 저장**하고, 그 목소리를 기억해 다음 회의에서도 인식합니다("Remembered voices. Recognized names."). 요금제별 화자 수 제한: Free 1명 / Pro 5명 / Premium 50명 / Team 100명.
- **타임스탬프**: 모든 발언이 `Maya · 00:12` 형식으로 화자+시각이 붙습니다.
- 사람이 직접 한 줄 메모를 쓰는 입력란: **확인 못 함.** 목업에서 보이는 것은 북마크와 전사 결과 편집(`✎`)뿐입니다.
- 단축키: **확인 못 함.**

### 회의록 구조

랜딩 목업에 **섹션 이름이 그대로 노출**됩니다. 이 조사에서 가장 명확한 구조 레퍼런스 중 하나입니다.

```
✦ AI summary
  Key decisions
    - Campaign launches on the 24th
    - Deck to marketing by Friday
  Action items
    - Chris — marketing deck by Friday
    - Sara — final assets by Thursday
```

- **결정(Key decisions) / 액션 아이템(Action items)** 2축.
- **액션 아이템에 담당자와 기한이 모두 있습니다**: `Chris — marketing deck by Friday`. 담당자는 이름, 기한은 자연어 요일.
- 노트 하단 탭: `Chat / Summary / Template / Transcript` → **요약과 원문 전사를 탭으로 분리**하고, 거기에 **Template** 탭을 둡니다.
- 커스텀 템플릿 요약은 Premium 이상: "Summaries with custom templates"
- 안건(agenda)·다음 회의 섹션: **확인 못 함.**

### 출력·공유

- 목업에 **`Copy summary` / `Export PDF`** 버튼이 나란히 있습니다. → **플레인 텍스트 복사와 PDF 두 갈래**.
- MCP 를 통한 Slack / Notion 연동이 **Free 플랜부터** 제공: "Board Chat integrations via MCP — Slack, Notion"
- 링크 공유: **확인 못 함.** 공개 랜딩에 공유 링크 언급이 없습니다.
- 카카오톡 연동: **확인 못 함.**

### 이 제품이 일부러 안 하는 것

- 회의록 도구에 머무르지 않고 **AI slides / PDF analysis / YouTube summary / AI doc translation / AI quiz** 로 넓혔습니다. 회의록은 입력 중 하나입니다.
- 규제 산업을 겨냥해 **on-premise LLM** 을 별도 제품으로 분리(SSO, 접근 통제, 보존 정책, 감사 로그, 내부 문서 RAG).

---

## 3. 카카오워크AI (카카오 계열)

- URL: https://kakaowork.gitbook.io/kakao-work/workservice/ai (공개 GitBook 문서)
- 제품 랜딩: https://www.kakaowork.com/
- 실제로 본 것: 공개 GitBook 문서 1페이지 전문. 로그인 불필요.

### 조사 결론: **카카오에는 "회의록 제품"이 없습니다**

요청에 "카카오 i 번역/메모 계열"이 있었지만, 공개 문서를 확인한 결과 **회의 중 받아 적기나 회의록 생성을 제품 기능으로 내세운 카카오 서비스를 찾지 못했습니다.**

카카오워크AI 의 공개 기능 표 전체(원문 그대로):

| 기능 | 설명 |
|---|---|
| 데일리 브리핑 | 매일 정해진 시간에 메일·일정·할 일 등 업무 현황을 한눈에 정리하여 전달 |
| 메일 | 안읽은 메일 조회, 메일 요약, AI 초안 작성 및 발송 |
| 캘린더 | 일정 조회·생성·수정·삭제, 참석자와의 가능 시간 추천 |
| 전자결재 | 문서 검색·요약, 승인 및 반려 처리 |
| 워크보드 | 글 검색·요약, 새 글 등록 |
| 할 일 | 할 일 조회·등록·수정·완료 처리 |
| 공간예약 | 빈 회의실 조회 및 예약·수정·취소 |
| 일반 검색 | 최신 웹 정보 기반 질의 응답 |
| 이미지 검색 | 채팅방 공유 이미지의 텍스트·태그 키워드 검색 |
| 실시간 번역(예정) | 다국어 채팅 메시지 실시간 번역 |
| 사내 검색(예정) | 사내 규정·매뉴얼 등 지식 기반 질의 응답 |

- **회의록 생성·녹음·전사 기능이 이 표에 없습니다.** "회의"는 **회의실 예약**으로만 등장합니다.
- 카카오워크 블로그(https://blog.kakaowork.com/277, /271) 검색 발췌에 "업로드한 **회의록** 파일 기반 질의응답", "긴 회의 내용을 빠르게 요약하고 싶을 때"가 보입니다 → **이미 만들어진 회의록 문서를 AI 에게 물어보는 용도**이고, 회의록을 만드는 쪽이 아닙니다. (블로그 본문은 미확인)
- 워크AI 는 **Premium 플랜 전용**.
- 데이터: "카카오워크AI 는 고객의 데이터를 AI 모델 학습에 활용하지 않습니다."

### gonote 에 주는 시사점

카카오 계열은 **레퍼런스로 쓸 것이 없습니다.** 한국 제품 레퍼런스는 클로바노트와 다글로 2개로 보시면 됩니다.

---

## 4. Notion AI Meeting Notes

- URL: https://www.notion.com/help/ai-meeting-notes (공개 도움말 전문 확인)
- 실제로 본 것: 공개 도움말 문서 전문(약 24,000자 중 핵심 전부). 로그인 불필요. 제품 내부는 **Business/Enterprise 플랜 필요**라 접근하지 않았습니다.

### 회의 중 입력 UX

**"내가 쓴 노트"와 "AI 요약"을 분리해서 둘 다 보관**하는 구조가 핵심입니다. gonote 처럼 사람이 적는 앱에 가장 가까운 사고방식입니다.

- **진입점이 4개**이고 모두 "한 동작":
  1. 아무 페이지에서 **`/meet`** 입력 → 그 페이지 안에 회의록 블록이 임베드됨 (**공개 문서에서 확인한 유일한 슬래시 명령**)
  2. 사이드바의 `Meeting notes` 탭
  3. compose 버튼
  4. 화상 회의에 들어가면 데스크톱 앱이 **알림을 띄워서** 시작을 권함
  - Home 의 `Upcoming events` 타일에서도 바로 시작 가능
- **회의 전에 미리 적어두면 AI 가 그걸 반영합니다** (원문): "Write any agenda items or context under `Notes` **before the meeting**. When generating the summary, Notion AI will take these notes into consideration."
  - → **`Notes` 영역은 사람 전용, 요약은 AI 전용**. 사람이 적은 안건이 요약의 입력이 됩니다.
- 전사 제어: `Start transcribing` → `Stop` → `Resume transcription`. 최소 1분 이상 녹음돼야 요약 생성.
- **발언자 지정**: "When AI Meeting Notes detects that the person speaking has changed, it will **start transcribing on a new line**." 캘린더 이벤트와 연결되면 상대 이름까지 라벨링. 다만 **같은 마이크를 여러 사람이 쓰는 대면 회의, 그룹 회의, 브라우저·모바일에서는 화자 라벨이 신뢰할 수 없다고 문서가 명시**합니다.
- **타임스탬프 역방향 이동 = citation**: "You'll also find **citations** to your transcript in your meeting notes summary. Hover over a citation to see the snippet… **click on a citation to jump to the corresponding line**."
  - → 북마크 대신 **요약 문장 ↔ 원문 줄을 양방향으로 잇는 인용 링크**를 씁니다.
- 북마크/하이라이트 버튼: **확인 못 함** (도움말에 없음).
- 단축키: `/meet` 외에는 **확인 못 함.**

### 회의록 구조

- **섹션을 고정하지 않고 "요약 지시문(Instructions)"으로 바꿉니다.**
  - 블록 하단 `Instructions` 드롭다운. 기본값 `Auto`.
  - 내장 지시문이 회의 유형별로 있음: "like a **sales call, standup, or team meeting**"
  - `+ Add custom instructions` → 템플릿 페이지가 열리고 **원하는 구조를 직접 정의**
  - 기존 요약에 새 지시문을 적용하려면 `Retry summary`
  - 아무 지시문이나 `Set as default` 로 기본값 지정
  - 커스텀 지시문은 **기본적으로 비공개(private by default)**. 공유된 지시문 페이지는 `+ Add to my instructions` 를 눌러야 내 목록에 들어옴.
- **회의 메타데이터는 데이터베이스 속성으로**: 회의록 페이지에 `Title`, `Date`, `Attendees` 가 내장 속성으로 붙습니다. 캘린더 이벤트와 연결되면 자동 입력.
  - → **참석자가 본문 텍스트가 아니라 구조화된 필드**입니다.
- 안건/논의/결정/액션아이템이라는 **고정 섹션 이름은 제품이 정하지 않습니다.** 사용자의 Instructions 가 정합니다.
- 액션 아이템: 회의 후 스킬 `Create follow-up tasks`, `Complete action items for me` 로 처리. **담당자·기한 필드는 확인 못 함** (생성되는 태스크 쪽에 있을 것으로 보이나 문서에 없음).
- **회의 중/회의 후로 나뉜 "스킬"** (원문 목록):
  - 회의 중: `Catch me up`, `Suggest questions`, `Recap decisions`
  - 회의 후: `Make summary more detailed`, `Create follow-up tasks`, `Complete action items for me`
  - 각 목록 최대 12개. 직접 만든 스킬(팔로업 메일, 슬랙 요약, tl;dr, 파일링, DB 속성 채우기)도 노출 가능.
  - 모바일 앱에서는 스킬 미지원.

### 출력·공유

- **페이지 단위 공유**: 회의록마다 독립된 sharing settings. 임베드된 블록은 `Open as page` 로 펼친 뒤 `Share`.
- **캘린더 참석자 자동 공유 (옵션)**: `Settings → Meeting notes → Auto-share with internal calendar event participants` 켜면 **워크스페이스 멤버인 참석자에게 보기+편집 권한이 자동 부여**됩니다. 꺼져 있으면 생성 후 "share with participants" 버튼이 뜸.
- **파일링**: 회의록은 `meetings database` 에 저장. 기본 DB 미지정 시 Notion 이 비공개 `My meetings` DB 를 자동 생성. `Filed in` 메뉴로 이동. 반복 회의는 같은 시리즈를 같은 DB 로.
- 오디오 업로드 지원 포맷: **AAC, M4A, MP3, WAV**.
- PDF/이미지 내보내기, 슬랙/카톡 연동: 이 문서에서는 **확인 못 함** (스킬로 "Slack recap"을 만들 수 있다는 언급만 있음).

### 이 제품이 일부러 안 하는 것

- **녹음 동의(consent)를 제품 기능으로 끌어올렸습니다.** 텍스트 동의문 복붙, **음성으로 동의문 재생**(언어별 음성 선택), 구두 요청, Google Meet 확장에서 채팅에 자동 공지+고정. 워크스페이스/조직 차원에서 **동의 재생 강제** 가능.
  - 주의 문구까지 있습니다: "The consent message plays through your **computer speakers**, not your conferencing mic. Be sure to **unmute your speakers and disconnect any headphones**."
- **브라우저와 모바일의 한계를 문서에 솔직히 적습니다.** 브라우저는 마이크만 전사(시스템 오디오 못 잡음), 헤드폰 쓰면 상대 목소리 안 들어감, 모바일은 대면 회의용. — gonote 가 브라우저 전용이므로 **이 한계 서술 방식 자체가 참고 자료**입니다.
- 모바일 앱에서 스킬을 제공하지 않습니다.
- Business/Enterprise 플랜 미만에는 아예 제공하지 않습니다.

---

## 5. Notion 한국어 회의록 템플릿 (마켓플레이스)

- 카테고리 URL: https://www.notion.com/ko/templates/category/meetings (템플릿 1,516개)
- **주의**: 요청에 있던 `https://www.notion.com/ko/templates/category/meeting-notes` 와 영문 `.../templates/category/meeting-notes` 는 **둘 다 404 ("죄송합니다. 해당 페이지를 찾을 수 없습니다")** 입니다. 올바른 슬러그는 `meetings` 입니다.
- 실제로 본 것: 검색 결과 발췌 + 개별 템플릿 페이지 2건의 구조 추출. 템플릿 미리보기 본문은 로그인/복제 없이 전부 보지 못했습니다.

### 확인한 한국어 템플릿

| 템플릿 | URL | 공개 페이지에서 확인한 구조 |
|---|---|---|
| 생산성이 높아지는 회의록 템플릿 (aporigen, 무료, ★4.8/19) | https://www.notion.com/ko/templates/meetingnote | **목적**(회의 목적을 한 문장으로) / **요약**(안건에 대한 요약) / **안건**(회의 아젠다를 **미리** 작성) — 그 뒤 항목은 확인 못 함 |
| 회의록 2026 (Notion 공식, ★4.8/51) | https://www.notion.com/ko/templates/meeting-notes-startup | "모든 회의록을 한곳에 모아두세요. **회의 유형별로 태그**해 쉽게 찾을 수 있습니다. **회의 일시 및 참석자** 등 유용한 정보도 쉽게 확인" |
| 회의록 \| 미팅 노트 (★5.0/9) | https://www.notion.com/ko/templates/meeting-noshooni | "회의 내용을 체계적으로 기록하고, **회의가 해야 할 일을 명확하게 관리**" |
| 회의록 정리 및 외부 공유 템플릿 (Meowdule, 무료) | https://www.notion.com/ko/templates/shared-meeting | **내부 회의록 / 외부 공유 회의록을 분리**, **잠금 설정**으로 외부 공유 시 일부 내용을 제외하고 공유 |
| 간단한 회의록 | https://www.notion.com/ko/templates/simple-meetings | 구조 확인 못 함 |
| 주간 회의록 | https://www.notion.com/ko/templates/weeklymeeting | 구조 확인 못 함 |

- 한국어 템플릿에서 반복적으로 등장하는 구조: **목적 → 안건(사전 작성) → 요약/논의 → 해야 할 일**, 그리고 메타로 **회의 일시 / 참석자 / 회의 유형 태그**.
- `목적`을 맨 앞에 두고 "한 문장으로"라고 제약을 거는 것은 해외 템플릿에서 보지 못한 패턴입니다.
- 담당자·기한 필드: `meetingnote` 템플릿에서 **확인 못 함** (추출 결과에 담당자/기한이 나왔으나 제 질의어가 그 단어를 포함했기 때문에 **환각 가능성이 있어 사실로 채택하지 않습니다**).

### 일부러 안 하는 것

- Notion 공식 `회의록 2026` 은 섹션을 강하게 고정하는 대신 **DB + 태그 + 속성**으로 갑니다. 섹션 스키마보다 **검색·필터**를 중시합니다.

---

## 6. Otter.ai

- URL: https://otter.ai/
- 실제로 본 것: 공개 랜딩 페이지 전체(히어로, 기능 카드, 연동 목록, 가격). **제품 내부는 로그인 벽** (Start for free → /signup). 도움말 센터(help.otter.ai)는 이번에 들어가지 않았습니다.

### 회의 중 입력 UX

- 랜딩이 강조하는 것은 **사람이 적는 것이 아니라 봇/데스크톱이 대신 적는 것**입니다.
- **Live transcription** + **speaker recognition**: "Live transcription in multiple languages, and speaker recognition."
- **Live-Assist coaching**: 통화 중 실시간 코칭·프롬프트를 띄움 (회의 중 화면에 무언가를 실시간으로 보여주는 UX 레퍼런스).
- **봇 없는 데스크톱 녹음**: "Record conversations directly from your Mac or Windows desktop, **without bots joining the call**."
- 사람이 직접 한 줄 메모를 넣는 입력, 북마크 버튼, 하이라이트, 단축키: **공개 랜딩에서 전혀 확인 못 함.** (Otter 에 하이라이트가 있다고 알려져 있으나 **이번 조사 범위의 공개 페이지에 근거가 없어 적지 않습니다.**)
- **Collaborative note editing** 은 Business 플랜($19.99/월) 기능으로 가격표에 명시 — 즉 **무료 플랜에서는 공동 메모 편집을 안 줍니다.**

### 회의록 구조

- "Otter turns every meeting into a clear summary with **decisions, action items, and insights**." → **결정 / 액션 아이템 / 인사이트** 3축.
- **액션 아이템에 담당자 배정이 있습니다**: "Clear next steps are **automatically captured and assigned** from every meeting."
- **Pre-call brief**: 회의 **전에** "all the prior discussions, action items, and updates" 를 담은 브리핑 문서를 보내줌 → 액션 아이템이 **회의 간에 이어집니다**.
- 안건/논의/다음 회의 섹션: **확인 못 함.**
- 기한(due date) 필드: Otter 자체에는 **확인 못 함**. 다만 Asana 연동 설명에 "simple action items **with deadlines**" 가 있습니다.

### 출력·공유

- **Channels**: "Meetings grouped by team, project, or topic so everyone can find recordings and collaborate in one shared space."
- 연동이 공유의 주된 수단입니다 (랜딩 연동 카드 원문):
  - **Slack** — "Instantly share transcripts, summaries, and key takeaways"
  - **Google Docs** — "Sync transcriptions and meeting notes for easy editing, sharing"
  - **Notion** — "Seamlessly sync your transcripts, notes, and key takeaways"
  - **Jira / Asana** — 액션 아이템을 태스크로
  - **Salesforce / HubSpot** — CRM 자동 기록
  - **Claude** / **MCP Server** — "ChatGPT, Claude, and other AI chat tools can securely access your meeting knowledge through Otter's MCP Server"
- 공유 링크, PDF, 이미지 내보내기: **확인 못 함.**
- 카카오톡: 없음(해외 제품).

### 일부러 안 하는 것

- 스스로를 notetaker 가 아니라 **"Conversational Knowledge Engine"** 으로 규정하고, 회의록 문서 자체보다 **회의 전·중·후의 흐름**(브리핑 → 라이브 코칭 → 자동 팔로업)에 집중합니다. "Your notetaker should do more than take notes."
- 무료 플랜에서 공동 편집과 파일 업로드 전사를 뺐습니다.

---

## 7. Fireflies.ai

- URL: https://fireflies.ai/
- 실제로 본 것: 공개 랜딩 페이지 전체. **제품 내부는 로그인 벽** (app.fireflies.ai/login).

### 회의 중 입력 UX

- **Comments & Bookmarks** 가 랜딩 기능 카드에 명시됩니다 (원문): "Leave **time-stamped comments** or **bookmark action items, important moments**, etc."
  - → **타임스탬프가 붙은 코멘트**와 **북마크**가 둘 다 있고, 북마크에 "액션 아이템" 같은 **의미 구분**을 붙입니다. gonote 가 참고할 가치가 큰 지점입니다.
- **Speaker Recognition**: "Fireflies identifies different speakers in meetings and audio files."
- **Speaker Talk-time**: 참가자별 발언 시간 자동 집계.
- **Live Assist**: 회의 중 실시간 제안·코칭·답변.
- Chrome 확장: Google Meet 통화를 자동 녹음하고 **실시간 전사** 제공.
- 단축키: **확인 못 함.**

### 회의록 구조

- 랜딩에 **요약 뷰의 탭 이름이 그대로 노출**됩니다: **`Overview` / `Bullet Points` / `Action Items` / `Custom Notes`**
  - → "액션 아이템"이 **독립 탭**입니다.
  - `Custom Notes` = 사용자 정의 섹션.
- **Tasks / Contacts / Feed** 라는 상위 뷰가 따로 있어, **액션 아이템이 회의록을 벗어나 할 일 목록으로 승격**됩니다: "All your Tasks, Contacts, & Knowledge in one place"
- **Expand Summary Notes**: "Expand specific summary bullet points for additional context and details." → **요약 불릿을 펼쳐서 근거를 보는** 접힘/펼침 UX.
- 담당자·기한: 프로젝트 관리 연동 쪽에 "Create tasks automatically after every meeting" 이 있으나 **Fireflies 내부 액션 아이템에 담당자·기한 필드가 있는지는 확인 못 함.**
- 안건/다음 회의 섹션: **확인 못 함.**

### 출력·공유

- **Download Meetings**: "Easily download **summary, transcript, meeting audio or video**." → 4종 다운로드.
- **Soundbites**: "Clip out important moments from calls into **easily shareable audio snippets**." → 오디오 조각 공유.
- **Channels / User Groups**: 팀별 채널로 묶고 그룹 단위 공유.
- **Slack**: "Get notes and alerts in the channels where you work."
- **Fireflies MCP Server**: Claude, Devin, ChatGPT 로 원클릭 연결.
- ATS(Greenhouse, Lever), CRM(Salesforce, HubSpot), PM(Asana, Trello) 로 회의록·전사 전송.
- 링크 공유, PDF: **확인 못 함.**

### 일부러 안 하는 것

- "Does Fireflies record without people knowing?" 을 **FAQ 항목으로 명시**(답변 본문은 아코디언이라 미확인) — 몰래 녹음 우려를 정면으로 다룹니다.
- **Zero Data Retention**: "Your data is never used for AI training or any purpose outside your direct business needs."
- 회의록을 넘어 **200+ AI Skills**(직무별)로 확장. 회의록 자체를 최종 산출물로 보지 않습니다.

---

## 8. tl;dv

- URL: https://tldv.io/ , https://tldv.io/features/ai-meeting-minutes/ (둘 다 공개)
- 실제로 본 것: 랜딩 페이지 전문 + "AI Meeting Minutes" 기능 페이지 전문. 제품 내부는 로그인 벽.
- 참고: 한국어 페이지도 있습니다 — https://tldv.io/ko/features/ai-meeting-minutes/

### 회의 중 입력 UX

- 회의 중 입력에 대한 서술이 의외로 적습니다. 기능 페이지의 "How to use" 6단계에서 **회의 중 단계는 "Run Your Meeting as Usual"** 이고, 태그·하이라이트·편집은 **회의 후 대시보드**에서 합니다 (원문 Step 5): "In your tl;dv dashboard, you can review transcripts, edit notes, **tag highlights**, and assign follow-up actions."
  - → **하이라이트가 회의 중이 아니라 회의 후 작업**으로 배치돼 있습니다.
- **키워드 알림**: "Was '{keyword}' mentioned in the meeting? You'll get notified" → 사용자가 미리 등록한 키워드가 언급되면 알림.
- **특정 순간에 코멘트 + 멘션**: "**Comment on key meeting moments** and get someone's attention to specific notes or action items in your meeting summary"
- 모바일 전용 앱 없음: "tl;dv doesn't have a native mobile app yet" (자동 녹음 기능으로 대체).
- 단축키: **확인 못 함.**

### 회의록 구조

- **섹션을 "주제별 자동 군집"으로 만듭니다.** 이 조사에서 tl;dv 만 이 방식을 명시합니다 (원문):
  - "Our AI understands your conversation's nuances and **automatically organizes your meeting minutes by topic**."
  - "**Skim AI meeting minutes clustered by topic.** Go straight to the key takeaways of every meeting."
- 추출 항목(원문): "From **next steps and pain points to objections**" / "summaries, **action items, objections, and decisions**, grouped by topic"
  - → **다음 단계 / 페인 포인트 / 반론 / 결정** — 세일즈 색이 강한 축.
- FAQ 가 "회의록(minutes)"을 정의합니다: "Meeting minutes are structured records of meeting outcomes, typically including **decisions, key takeaways, action items, and attendees**" → **결정·핵심·액션·참석자 4축**이 이 제품의 회의록 정의입니다.
- **템플릿 + 룰 자동 적용**: "Use built-in meeting minutes templates or customize your own AI-powered structure. **Apply your template per meeting or automate it for all future calls that match your rules.**"
  - 예시로 "MEDDIC in Japanese, Smart AI Topics in Spanish" 같은 **프레임워크 × 언어** 조합을 듭니다.
- **스마트 프롬프트**로 "structure, tone, focus, and format" 제어.
- **여러 회의를 한꺼번에 요약**: "Select multiple meetings and prompt tl;dv to generate a concise, AI-powered summary of the entire week."
- 액션 아이템 담당자: "assign specific meeting moments or action items directly to your team" → **배정은 됨**. 기한 필드는 **확인 못 함**.

### 출력·공유

- **회의 종료 시 참석자 전원에게 자동 발송**: "AI-generated meeting minutes are **automatically sent to all participants once your call ends**. Choose to enable this for individual or recurring meetings."
  - → 공유 버튼을 누르는 게 아니라 **기본이 자동 배포**입니다. 조사한 제품 중 이것을 가장 강하게 밀고 있습니다.
- **Slack 자동 공유**: "Automatically send meeting recordings, AI-generated meeting minutes, and key insights to Slack"
- **CRM 필드 매핑**: "Map your AI meeting minutes **template to CRM fields**, and your CRM will auto-fill the moment your call ends." → 회의록 템플릿의 각 섹션이 CRM 필드에 대응.
- **tl;dv Reels**: 하이라이트 클립 생성 후 공유.
- Notion, Google Docs, Trello, Asana + Zapier 5,000+.
- 전사·요약 **번역** 지원(30+ 언어).
- PDF/이미지/링크 공유: **확인 못 함.**

### 일부러 안 하는 것

- **회의 중에 사람이 개입하는 UX 를 거의 만들지 않았습니다.** 표어가 "Never take meeting notes again". 사람의 역할을 회의 후 리뷰로 밀어냈습니다.
- 네이티브 모바일 앱을 만들지 않았습니다.
- 데이터로 AI 를 학습시키지 않음: "we'll never, ever use them to train AI. Ever." EU 호스팅, 요청 시 프라이빗 AI.

---

## 9. Granola

- URL: https://www.granola.ai/
- 실제로 본 것: 공개 랜딩 페이지 전체. 랜딩에 **제품 UI 를 HTML 로 재현한 목업**이 있어 노트 본문과 플레이스홀더 텍스트를 그대로 읽었습니다. 제품은 **다운로드 전용(macOS/Windows/iOS/Android)**, 웹 앱 내부는 접근 안 함.

### 회의 중 입력 UX

**gonote 와 가장 사상이 비슷한 제품입니다.** "사람이 적는다"를 전제로 하고, AI 가 그 메모를 **보강**합니다.

- 노트 본문의 플레이스홀더가 **`Write notes...`** 입니다. 즉 **빈 에디터에 그냥 타이핑**하는 구조. 폼도, 섹션 선택도 없습니다.
- 핵심 문구 (원문): "**Write down as much or as little as you like** - Granola uses meeting context to write clear notes, personal to you."
  - → **거칠게 적어도 된다**를 제품 약속으로 내세웁니다. 회의 중 입력 부담을 낮추는 설계.
- "Don't choose between listening and taking good notes."
- **내 메모 / 보강된 노트 2단 토글**: 목업 하단에 **`My notes` | `Enhanced`** 탭이 있고, 그 왼쪽에 상태 표시 `Enhancing notes` / `Transcribing` / `Generate notes` 버튼이 있습니다.
  - → **원본(내가 친 것)과 결과(AI 가 정리한 것)를 둘 다 보관하고 전환**합니다. 클로바노트·Notion 과 같은 패턴이며, Granola 는 이것을 **탭 토글**로 가장 명확히 노출합니다.
- 상단에 회의 제목 + `Today` + 참석자 수(`4`, `2`) 표시.
- 하단에 `Ask anything` 입력창(회의 중에도 노출).
- 봇 없음: "Uses your computer audio, **so doesn't invite a bot**"
- 타임스탬프, 북마크 버튼, 하이라이트, 단축키: **확인 못 함.** 목업과 랜딩 어디에도 시각 표시가 없습니다. (이 제품은 타임스탬프를 전면에 두지 않는 것으로 보이나 단정하지 않습니다.)
- **Voice typing** 이라는 신기능이 별도 페이지로 있음: https://www.granola.ai/voice-typing (내용 미확인)

### 회의록 구조

랜딩 목업에 **완성된 회의록 예시가 통째로** 들어 있습니다. 이것이 가장 좋은 구조 레퍼런스입니다.

```
Q3 GTM sync                      (제목)

ICP Alignment Confirmation       ← 주제 1 (논의 내용 그대로를 제목화)
 • Agreed to narrow Q3 focus to mid-market finance and ops buyers
   – SMB deprioritised for the quarter
   – Paid campaigns paused until ICP doc is confirmed

Deal Stalls: Sales Input         ← 주제 2
 • Jack flagged deals stalling at business case stage
   – Marketing to build a business case template
   – CS to share proof points from successful onboardings
 • Follow-up scheduled for Tuesday

Q3 Messaging Rollout             ← 주제 3
 • Sales and CS do not yet feel briefed on new messaging
   – Lunch and learn session agreed

Next Steps                       ← 마지막 고정 섹션
 • Tanya: Update ICP doc and pause paid campaigns
 • Rob: Scope business case template by Tuesday
 • Jack: Collate CS proof points by Tuesday
```

두 번째 예시(Northwind Sync)도 동일한 형태입니다: 주제 3개 + `Next steps`.

- **구조 = 주제별 블록(가변) + `Next Steps`(고정 1개)**. 안건/논의/결정을 따로 나누지 않고, **주제 제목 자체가 안건**이고 그 아래 불릿이 논의, 들여쓴 불릿이 결정/후속입니다.
- **2단 들여쓰기**: `•` 는 논의 요지, `–` 는 그에 딸린 결정·조치.
- **액션 아이템에 담당자와 기한이 모두 있습니다**: `Rob: Scope business case template **by Tuesday**`, `Tanya: Update ICP doc`(기한 없음도 허용). 형식은 **`이름: 할 일 [by 기한]`** 한 줄.
- **Brief (회의 전)**: 캘린더와 동기화해 외부 미팅마다 "누가 참석하는지, 지난번에 무슨 이야기를 했는지, 지금 중요한 것" 을 정리.
- **Granola Chat (회의 후)**: "What did I promise to do in my meetings this week?" 처럼 **여러 회의를 횡단하는 질문**.
- 액션 버튼: `List actions`, `Write follow-up email`, `Draft project plan`

### 출력·공유

- **기본이 비공개**: "**Private by default**, easy to share if you choose" / "Your notes are just for you. Search them, polish them, analyze them, then send them as you like."
- 목업에 **`Share notes` 메뉴가 열려 참석자 목록이 나열**되는 스크린샷 설명이 있습니다: "A Granola note with a **Share notes menu open, listing meeting participants** to share with"
  - → 공유 대상이 **참석자 목록에서 고르는 방식**.
- **Granola MCP Connector**: "No more copy-pasting meeting transcripts into AI tools." Claude, OpenAI, Cursor, Figma, Replit, v0, Bolt, Lovable, Manus 등으로 연결.
- PDF, 이미지, 플레인 텍스트, 링크 공유, 슬랙: **모두 확인 못 함.**
- 무료 플랜: 노트 수 무제한, **30일보다 오래된 노트를 보려면 유료**.

### 일부러 안 하는 것

- **회의에 봇을 보내지 않습니다.** 컴퓨터 오디오를 씁니다. "Humans in the room, not bots."
- **기본 공유를 하지 않습니다.** tl;dv 와 정반대 선택.
- 회의록 구조를 사용자에게 설정하게 하지 않습니다. 템플릿·Instructions UI 가 랜딩에 없습니다.
- 평점: App Store 4.96/5 (14,637개) — 이 단순함이 작동한다는 신호로 볼 수 있습니다.

---

## 10. Fathom

- URL: https://fathom.video/ (→ https://www.fathom.ai/ 로 리다이렉트)
- 도움말: https://help.fathom.video/en/articles/295424 (공개, 로그인 불필요)
- 실제로 본 것: 공개 랜딩 전체 + "Marking Highlights on a Call" 도움말 전문.
- 특이사항: 랜딩 상단 배너 — **"FATHOM IS NOW PART OF SUPERHUMAN."**

### 회의 중 입력 UX

**"회의 중 하이라이트"를 가장 자세히 문서화한 제품**이며, 동시에 **그 기능을 신버전에서 빼고 있는 중**이라 매우 흥미로운 레퍼런스입니다.

- 작동 방식 (도움말 원문): "When you click a highlight button on a call, Fathom **earmarks that portion of the call** so you can review or share it later."
- **구간의 시작·끝을 자동으로 정합니다** (원문): "When you click on a Highlight, Fathom captures that section **retroactively to when your attendee started talking**. It then **listens for when you start talking again** (excluding any short phrases like 'ok' or 'tell me more') to determine where that highlight should end automatically."
  - → 사용자는 **버튼 한 번**만 누르고, 구간 경계는 제품이 추론합니다. 수동 종료도 가능(같은 하이라이트 재클릭).
- **하이라이트에 종류를 붙일 수 있습니다**: "Configuring Highlight Types" / custom highlight types (https://help.fathom.video/en/articles/278720, 내용 미확인)
  - → 북마크를 단일 종류가 아니라 **분류된 마커**로 씁니다. Fireflies 의 "bookmark action items, important moments" 와 같은 발상.
- **회의 후에도 추가 가능**: "clicking the **plus icon on the left side of a transcript bubble**" → 전사 말풍선 왼쪽 + 버튼.
- **중요 — 신버전에서는 회의 중 하이라이트를 제공하지 않습니다** (도움말 공지 원문):
  - "In-meeting highlights are available in the **previous Fathom experience**. If you're on the **new bot-free experience**, **highlights during a call are not currently available** — you can still add them after the call from the transcript. Post-meeting clips are coming soon as a replacement."
  - → 봇을 없애면서 회의 중 마커를 잃었고, **회의 후 클립으로 대체**하려 하고 있습니다. gonote 는 봇 제약이 없으니 **회의 중 마커를 지킬 수 있는 쪽**입니다.
- 단축키: **확인 못 함.**

### 회의록 구조

- "summaries, searchable transcripts, and instant follow-ups" / "**Action items**, key moments, and important context are recorded and searchable"
- "customizable AI summaries tailored to your team's workflow and priorities" → 커스터마이즈 가능.
- **AI Scorecards**: 통화를 루브릭으로 채점(세일즈 코칭용).
- **Trackers**: "Automatically monitor key topics so you never miss critical moments"
- 안건/결정/다음 회의 섹션, 담당자·기한: **확인 못 함.**

### 출력·공유

- **이메일로 발송**: "delivered straight to your inbox, like magic."
- 자동 동기화: **Slack, Salesforce, HubSpot, Notion, Asana**, Gmail
- "**Easily Share Highlights & Clips**: Clip key moments from any call and share them with teammates, prospects, or leadership in a couple of clicks." (Chrome 웹스토어 설명 발췌)
- **Highlights playlists**: 신입 온보딩용 하이라이트 재생목록.
- "Your meeting data, now inside **ChatGPT, Claude, and more**"
- PDF, 이미지, 링크 공유: **확인 못 함.**

### 일부러 안 하는 것

- **봇을 없애는 쪽을 택하면서 회의 중 하이라이트를 희생했습니다.** 기능 간 트레이드오프를 공개 문서에서 인정하는 드문 사례.
- 개인에게 무료("free forever")로 풀고 팀 기능에서 과금.

---

## 11. Supernormal

- URL: https://supernormal.com/ (→ https://www.supernormal.com/)
- 실제로 본 것: 공개 랜딩 페이지 전체. 템플릿 갤러리(https://www.supernormal.com/templates)는 링크만 확인하고 들어가지 않았습니다. 제품 내부는 로그인 벽("Unlock more features — Attach files and images, apply themes, connect integrations, and more by **signing in**").

### 회의 중 입력 UX

- 공개 랜딩에서 **회의 중 입력 UX 에 대한 서술을 전혀 찾지 못했습니다.** 랜딩이 2026년 현재 **"AI agents built for agencies"** 로 재포지셔닝되어, 회의록은 전처리 단계로만 등장합니다.
- 회의록 전용 페이지가 따로 있음: https://www.supernormal.com/meeting-notetaker ("AI meeting notes **without bots**") — **이 페이지는 이번에 확인하지 않았습니다.**
- 북마크·하이라이트·타임스탬프·단축키·발언자 지정: **전부 확인 못 함.**

### 회의록 구조

- **"회의록 = 최종 산출물이 아니라 입력"** 이라는 관점이 명확합니다 (원문): "Each template **runs on your meeting notes**. Pull in documents or emails when you need extra context."
- 제공 템플릿(회의 → 산출물 변환):
  | 템플릿 | 변환 |
  |---|---|
  | Pitch decks | 브레인스토밍 → 피치덱 |
  | Creative briefs | 킥오프 → 크리에이티브 브리프(목표/방향/오디언스 인사이트) |
  | One-pagers | 통화 → 원페이저(제품 상세/컨텍스트/고객 인사이트) |
  | Presentations | 팀 회의 → 프레젠테이션 |
  | Instagram imagery | 캠페인 브리프 → 인스타 비주얼 |
  | Proposals | 디스커버리 콜 → 제안서(scope/context/next steps) |
- 안건/논의/결정/액션아이템이라는 **회의록 자체의 섹션 구조는 랜딩에서 확인 못 함.**

### 출력·공유

- 산출물 형식이 곧 공유 형식입니다: **AI Slides / AI Documents / AI Spreadsheets / AI Images**
- "ready to **present**", "ready to **share**", "ready to **send**", "ready to **post**" 라는 표현으로 산출물마다 도착지를 다르게 둡니다.
- 데스크톱 앱 다운로드(macOS Apple Silicon 14.4.1+, Windows 11+).
- PDF, 링크 공유, 슬랙: **확인 못 함.**

### 일부러 안 하는 것

- **회의록을 읽히는 문서로 만들지 않습니다.** 회의록을 바로 **고객 제출물**(덱·브리프·제안서)로 변환하는 데 집중합니다.
- 봇으로 통화에 참여하지 않습니다 ("without bots", FAQ "Does Supernormal join client calls?" — 답변 본문 미확인).

---

## 12. Obsidian — Meeting Notes Plus 플러그인 + 커뮤니티 템플릿

- 플러그인: https://community.obsidian.md/plugins/meeting-notes-plus (공개)
- 템플릿 글: https://dannb.org/blog/2023/obsidian-meeting-note-template/ (검색 결과에 템플릿 전문이 포함되어 그것으로 확인)
- 실제로 본 것: 플러그인 공개 소개 페이지 전문, dannb 템플릿 코드(검색 발췌로 전문 노출). 다운로드 335회, v1.0.3, MIT, 데스크톱+모바일.

### 회의 중 입력 UX

- **모달로 메타데이터를 먼저 받습니다**: "New Meeting modal (**title, date, attendees, type, agenda**)"
  - → 회의 시작 전에 5개 필드를 한 화면에서 입력. 회의 중에는 본문만 칩니다.
- **액션 아이템을 텍스트 문법으로 적습니다**: "Action items use **checkbox syntax with @owner**"
  - → `- [ ] 할 일 @chris` 형태. **담당자를 UI 가 아니라 `@멘션` 으로 입력**합니다. 손이 빠른 사람에게 가장 빠른 방식이고, gonote 처럼 서버 없는 앱에 매우 잘 맞습니다.
- 사이드바: "Meetings sidebar: recent meetings with **title, date, attendee count, action count**"
  - → 목록에 **액션 개수**를 숫자로 보여줍니다.
- 타임스탬프, 북마크, 하이라이트, 단축키: **확인 못 함** (플러그인 명령은 "Extract Actions" 만 공개됨).

### 회의록 구조

- 플러그인이 만드는 노트 구조(원문): "Structured note with **frontmatter + Agenda/Notes/Decisions/Action Items** sections"
  - → **안건 / 논의 / 결정 / 액션 아이템** — 요청하신 전통적 4단 구조를 **그대로 쓰는 유일한 사례**입니다.
- dannb 템플릿(전문):
  ```markdown
  ---
  date: <% tp.file.creation_date() %>
  type: meeting
  company:
  summary: " "
  ---

  **Attendees**:
  -

  ## Agenda/Questions
  -

  ## Notes
  -
  ```
  - 설계 의도(원문): "There should be designated space for an **agenda (pre-meeting planning)** and meeting notes"
  - → **안건은 회의 전, 노트는 회의 중** 으로 공간을 분리. `summary` 를 frontmatter 에 둔 것도 특징.
- Reddit r/ObsidianMD 의 실제 워크플로 발췌: "1- Prepare agenda (normally from **previous action items** / new topics) 2- Document discussed topics. 3- **Extract action items separately.** 4- Copy …"
  - → 지난 회의의 액션 아이템이 다음 회의의 안건이 되는 **순환 구조**.
- 기한(due date) 필드: **확인 못 함** (`@owner` 만 명시).

### 출력·공유

- **액션 아이템 집계**: "**Extract Actions** command: copies **unchecked items** to **master Actions note**"
  - → 체크 안 된 액션만 뽑아 마스터 노트로 모읍니다. 이 조사에서 **이 제품만 가진 기능**입니다.
- 설정: meetings folder, actions note path (저장 위치만 설정).
- 출력은 **마크다운 파일 그 자체**입니다. PDF·이미지·링크 공유·슬랙 연동 모두 **없음**(플러그인 범위 밖).

### 일부러 안 하는 것

- **공유를 전혀 하지 않습니다.** 로컬 마크다운 파일로 끝. 공유는 Obsidian/사용자 몫.
- AI 가 없습니다. **섹션을 사람이 직접 채웁니다.** 그래서 "액션 아이템 자동 추출"이 "**체크박스 문법으로 적힌 것을 모으기**" 로 대체됩니다 — gonote 처럼 AI 없이 구조를 얻어야 하는 경우의 정석적인 답입니다.

---

## 13. Craft — Meeting Notes 템플릿

- 템플릿: https://www.craft.do/templates/meeting-notes-template (공개)
- 미리보기: https://documents.craft.me/uzOawbwaSTwY5P (링크 확인, 내용 미확인)
- Daily notes 도움말: https://support.craft.do/en/plan-and-do/daily-notes (검색 발췌만 확인)
- 실제로 본 것: 템플릿 소개 페이지 전문. 로그인 불필요.

### 회의 중 입력 UX

- 템플릿 설명이므로 입력 UX 자체는 거의 없습니다. 다만 템플릿의 목적을 **"random scribbles"(되는대로 적은 낙서)를 막는 것**으로 규정합니다.
- Daily notes 에 회의록을 넣는 워크플로: "Daily notes in Craft give you a dedicated page for each day where you can capture thoughts, plan your day, track tasks, and **organize meeting notes**." + 템플릿으로 매일 같은 구조 재사용.
- 타임스탬프·북마크·하이라이트·단축키·발언자 지정: **모두 확인 못 함.**

### 회의록 구조

4개 섹션이 명확하고, **각 섹션의 "언제 채우는가"가 서술돼 있습니다** (원문 요약):

| 순서 | 섹션 | 채우는 시점 / 지침 |
|---|---|---|
| 1 | **Attendees** | 시작 시. "listing all participants. It creates a clear record of who partook" |
| 2 | **What outcomes do we want for this meeting?** | **회의 전**. "Set the stage by outlining the meeting's goals. This proactive approach ensures discussions remain productive and on track" |
| 3 | **Meeting Notes** | 회의 중. "As conversations progress, record **main points, decisions, and notable insights**" |
| 4 | **Action Items** | 회의 끝. "tasks or decisions needing follow-up. **Assign roles, stipulate deadlines**, and foster accountability" |

- → **액션 아이템에 담당자(roles)와 기한(deadlines)이 명시적으로 요구**됩니다.
- 특징: 안건을 "Agenda" 가 아니라 **"이 회의에서 우리가 원하는 결과는?"** 이라는 질문문으로 둡니다. 조사한 제품 중 유일합니다.
- 결정(decisions)을 별도 섹션으로 빼지 않고 **Meeting Notes 안에 포함**시킵니다.

### 출력·공유

- 템플릿 페이지 자체가 **공개 웹 문서 링크**(documents.craft.me/...)로 미리보기됩니다 → Craft 는 문서를 **공개 URL 로 발행**할 수 있습니다.
- 템플릿 적용은 URL 스킴: `docs.craft.do/?go=new-from-template&url=...`
- PDF·이미지·슬랙: **확인 못 함.**

### 일부러 안 하는 것

- AI 없음. **순수 템플릿**입니다.
- 결정을 독립 섹션으로 만들지 않습니다(섹션 수를 4개로 억제).

---

## 14. Apple Voice Memos / Apple 메모

- Voice Memos(Mac) 사용 설명서: https://support.apple.com/guide/voice-memos/welcome/mac
- 실제로 본 것: 공식 사용 설명서 **첫 페이지만**. 로그인 불필요.
- **이 제품은 조사가 가장 얕습니다.** 하위 문서(녹음 생성/편집/공유)에 들어가지 않았습니다.

### 확인한 것

- Voice Memos 는 회의 녹음을 **1차 사용 사례로 명시**합니다 (원문): "With Voice Memos on Mac, you can easily **record meetings, lectures, song ideas, and more**. **Just click Record.**"
- 사용 설명서 메타 설명: "Learn how to use Voice Memos on Mac to **create recordings, edit and trim them, then share them** with your friends."
  - → 기능 축은 **녹음 / 편집·트리밍 / 공유** 3개.
- UI: "The Voice Memos window showing the **Record button at the bottom left**." → 버튼 1개 중심.

### 확인 못 한 것 (전부)

- 회의 중 한 줄 메모 입력, 타임스탬프 메모, 북마크/마커, 하이라이트, 단축키, 발언자 지정
- 회의록 섹션 구조 (애초에 회의록 문서를 만드는 제품이 아님)
- 액션 아이템, 담당자·기한
- 공유 형식의 구체적 모습
- **Apple 메모(Notes)** 의 회의 활용: 이번 조사에서 **전혀 확인하지 않았습니다.** (iOS 18+ 의 Notes 녹음·전사 기능이 있다고 알려져 있으나 공개 문서를 보지 않았으므로 적지 않습니다.)

### 일부러 안 하는 것 (추정이 아닌 관찰)

- Voice Memos 는 **회의록 문서를 만들지 않습니다.** 오디오 파일 + 트리밍 + 공유에서 멈춥니다. 구조화·액션 아이템·요약이 제품 범위에 없습니다.

---
---

# 종합 1 — 여러 제품에 공통으로 나타난 기능 (빈도순)

**이 표만 채택하시면 됩니다.** 빈도는 "공개 문서에서 근거를 확인한 제품 수"입니다. 추정으로 센 것은 없습니다. 전체 조사 대상은 14개이지만, 회의록 문서를 만들지 않는 카카오워크AI·Voice Memos 를 빼면 실질 모집단은 **12개**입니다.

| # | 기능 | 확인 제품 수 | 출처 제품 | 구현 형태 (가장 참고할 것) |
|---|---|---|---|---|
| 1 | **액션 아이템 / 다음 단계를 독립 섹션으로 둔다** | **9** | 클로바노트(next steps), daglo(Action items), Granola(Next Steps), Otter, Fireflies(Action Items 탭), tl;dv, Obsidian MNP(Action Items), Craft(Action Items), Notion(follow-up tasks) | 회의록 **맨 마지막 고정 섹션**. Granola 형식 `이름: 할 일 [by 기한]` 한 줄이 가장 간결 |
| 2 | **회의 메타데이터를 본문과 분리 (제목·일시·참석자)** | **7** | Notion(Title/Date/Attendees 속성), 클로바노트(미리 title/participants/topic), Obsidian MNP(모달 title/date/attendees/type), Craft(Attendees), daglo(3 participants), Notion 한국어 템플릿(회의 일시·참석자·유형 태그), tl;dv(attendees 를 minutes 정의에 포함) | **회의 시작 전 한 화면에서 입력**(Obsidian 모달) 또는 상단 고정 필드 |
| 3 | **회의 전에 안건/목표를 미리 적고, 그것이 회의록의 뼈대가 된다** | **7** | Notion("Write any agenda items **before the meeting**" → 요약에 반영), 클로바노트(노트 미리 준비), Granola(Brief), Obsidian MNP(모달 agenda), dannb 템플릿(Agenda = pre-meeting planning), Craft(What outcomes do we want?), Notion 한국어 템플릿(안건을 미리 작성) | 안건 칸을 **회의 전 전용**으로 명시. 회의 중 칸과 **물리적으로 분리** |
| 4 | **타임스탬프 앵커 — 메모/요약에서 원본 시점으로 점프** | **5** | 클로바노트("메모가 작성된 시간을 클릭하면 해당 구간"), Notion(citation hover + click to jump), Fireflies(time-stamped comments), daglo(`Maya · 00:12`), tl;dv(특정 순간에 코멘트) | **입력 즉시 시간이 자동으로 붙는다.** 사용자가 시간을 적지 않는다 (클로바노트) |
| 5 | **버튼 한 번으로 "지금 이 순간" 표시 (북마크/하이라이트)** | **5** | 클로바노트(북마크 버튼 + 하이라이트), Fathom(highlight button, 구간 자동 결정), Fireflies(Comments & Bookmarks), daglo(Add bookmark), tl;dv(tag highlights — 단 회의 **후**) | **버튼 1개.** 구간 경계는 제품이 알아서 (Fathom) |
| 6 | **"내가 쓴 것"과 "정리된 것"을 둘 다 보관하고 전환** | **4** | Granola(`My notes` / `Enhanced` 탭), Notion(사람용 `Notes` + AI 요약), 클로바노트(메모 + 음성기록), daglo(`Summary` / `Transcript` 탭) | **탭 토글**이 가장 명확 (Granola). 원본을 절대 덮어쓰지 않음 |
| 7 | **섹션 구조를 사용자가 바꿀 수 있다 (템플릿/지시문)** | **5** | Notion(Instructions + custom + set as default), tl;dv(템플릿 + 룰 자동 적용 + 스마트 프롬프트), Fireflies(Custom Notes), daglo(custom templates), Supernormal(템플릿별 산출물) | 기본값 `Auto` 하나 + 직접 정의 (Notion) |
| 8 | **링크로 공유 (문서 단위)** | **5** | 클로바노트(비밀번호+유효기간+부분공유), Notion(페이지별 Share), Granola(참석자 목록에서 선택), Craft(공개 웹 문서 URL), Otter(share) | **기본 비공개, 명시적으로만 공유** (Granola, 클로바노트) |
| 9 | **플레인 텍스트/파일로 내보내기** | **4** | daglo(`Copy summary` + `Export PDF`), 클로바노트(여러 포맷 다운로드), Fireflies(summary/transcript/audio/video 다운로드), Obsidian(마크다운 파일 자체) | **복사 버튼 + 파일 내보내기 2개 나란히** (daglo) |
| 10 | **액션 아이템에 담당자를 붙인다** | **4** | Granola(`Tanya: …`), daglo(`Chris — …`), Otter("automatically captured and **assigned**"), Obsidian MNP(`@owner` 체크박스), Craft("Assign roles") | **`@멘션` 또는 `이름:` 접두**. 별도 UI 없이 텍스트로 (Obsidian) |
| 11 | **액션 아이템에 기한을 붙인다** | **3** | Granola(`by Tuesday`), daglo(`by Friday`), Craft("stipulate deadlines") | **자연어 그대로**(`by Tuesday`). 날짜 피커 아님 |
| 12 | **결정(Decisions)을 독립 섹션으로 둔다** | **4** | daglo(Key decisions), Otter(decisions), tl;dv(decisions), Obsidian MNP(Decisions) | 논의와 결정을 분리. 단 Granola·Craft 는 **일부러 분리하지 않음** |
| 13 | **주제별로 내용을 묶는다 (안건 = 주제 제목)** | **4** | Granola(주제 제목 + 2단 들여쓰기), tl;dv("clustered by topic"), 클로바노트(main topics), Fireflies(Bullet Points) | **주제 제목이 곧 안건.** 고정 섹션 대신 가변 블록 (Granola) |
| 14 | **표시한 것만 모아 보기** | **3** | 클로바노트([모아보기]로 북마크/하이라이트/링크만), Obsidian MNP(unchecked actions → master note), Fireflies(Tasks 뷰) | 노트 안에서 **필터 뷰** (클로바노트) |
| 15 | **발언자 지정/구분** | **4** | 클로바노트(하이라이트·메모 단위), daglo(Speaker ID, 이름으로 재명명), Notion(화자 바뀌면 줄바꿈), Fireflies(Speaker Recognition) | **화자가 바뀌면 새 줄**이라는 최소 규칙 (Notion) |
| 16 | **검색** | **4** | 클로바노트(Search Notes), Fireflies(Meeting Search), Otter, Granola | — |
| 17 | **외부 도구로 보내기 (Slack 등)** | **6** | Otter, Fireflies, tl;dv, Fathom, Supernormal, daglo(MCP) | gonote 에는 **적용 불가**(서버 없음). 대신 "복사해서 붙여넣기"로 대체 |

## gonote 제약과의 교차 검증

| 공통 기능 | gonote(브라우저 전용·서버 없음·받아쓰기 없음)에서 가능한가 |
|---|---|
| 1 액션 아이템 섹션 | 가능 |
| 2 메타데이터 분리 | 가능 |
| 3 회의 전 안건 입력 | 가능 |
| 4 타임스탬프 앵커 | **가능** — 받아쓰기가 없어도 **입력 시각**은 찍을 수 있습니다. 클로바노트의 "타이핑하면 작성 시간과 함께 기록"이 그대로 적용됩니다. 점프 대상이 오디오가 아니라 **그 메모 자체**가 됩니다 |
| 5 버튼 한 번 북마크 | **가능** — 오디오 없이도 "중요 표시" 로 성립. 단 Fathom 식 "구간 자동 결정"은 불가(오디오 없음) |
| 6 원본/정리본 2단 | **부분 가능** — AI 보강은 불가. 다만 **"받아 적은 날것" / "정리한 회의록"** 2단 토글은 사람이 손으로도 성립 |
| 7 템플릿/섹션 커스터마이즈 | 가능 |
| 8 링크 공유 | **불가** — 서버가 없어 URL 호스팅이 안 됩니다. 대체: **텍스트 복사 / 파일 다운로드 / URL 해시에 데이터 인코딩** |
| 9 텍스트·파일 내보내기 | **가능 — 가장 중요** |
| 10 담당자 | 가능 (`@멘션` 텍스트 문법) |
| 11 기한 | 가능 (자연어) |
| 12 결정 섹션 | 가능 |
| 13 주제별 묶기 | 가능 |
| 14 모아 보기 | 가능 |
| 15 발언자 지정 | **가능 — 수동으로.** 받아쓰기가 없으니 자동 화자 분리도 없고, **사람이 한 줄마다 화자를 고르는 UX** 가 필요합니다. 참고할 수 있는 선례: daglo 의 "Participant1 → Jake 재명명", Obsidian 의 `@owner` 문법 |
| 16 검색 | 가능 (로컬) |
| 17 외부 전송 | 불가 → 복사/붙여넣기로 대체 |

### 특히 짚어둘 공백

**"사람이 회의 중에 빠르게 한 줄을 넣는" 구체적 조작 방법은, 조사한 12개 제품 중 2개만 공개 문서로 확인됐습니다.**

- **클로바노트**: 녹음 중 노트에 **그냥 타이핑** → 작성 시간 자동 기록
- **Granola**: 플레이스홀더 `Write notes...` 에 **그냥 타이핑**, "많이 적든 적게 적든 상관없다"

나머지 10개는 **받아쓰기가 사람의 입력을 대체**하는 설계라, 이 축의 레퍼런스가 사실상 없습니다. 그리고 두 사례가 택한 답은 똑같이 **"구조 없는 빈 에디터에 그냥 친다"** 입니다. 단축키도, 폼도, 섹션 선택도 아닙니다. 구조는 **입력이 아니라 출력 단계**에서 입혀집니다.

이 점이 이 조사에서 가장 중요한 발견이라고 봅니다.

---

# 종합 2 — 한 제품에만 있는 것 (후보)

채택하지 마시고, **나중에 검토할 후보**로만 보시면 됩니다. 각 항목에 출처 제품을 붙였습니다.

### 회의 중 입력 관련 후보

| 후보 | 출처 제품 | 내용 | gonote 적용 가능성 |
|---|---|---|---|
| **메모의 단어를 음성인식 사전으로 재활용** | 클로바노트 | "클로바노트는 작성된 메모에서 **주요 단어를 추출해 더 정확한 음성인식 결과**를 제공합니다" | **적용 불가** (받아쓰기 없음). 다만 "사용자가 적은 단어를 다른 기능에 재활용한다"는 발상은 자동완성·검색에 응용 여지 있음 |
| **하이라이트 구간을 버튼 1번으로 자동 결정** | Fathom | 클릭 시 **상대가 말을 시작한 지점까지 역추적**하고, 내가 다시 말하기 시작하는 지점에서 자동 종료("ok", "tell me more" 같은 짧은 말은 제외) | 적용 불가 (오디오 필요) |
| **북마크에 종류를 붙인다 (custom highlight types)** | Fathom | 하이라이트 타입을 직접 정의 | **적용 가능.** 북마크를 단일 종류가 아니라 `결정 / 할 일 / 질문` 같은 분류 마커로 |
| **입력 역할을 기기별로 분리** | 클로바노트 | 실시간 메모는 **PC 전용**, 모바일은 녹음·북마크 전용 | gonote 는 PWA 1개이므로 직접 적용은 아니지만, **"모바일에서는 긴 타이핑을 기대하지 않는다"** 는 판단은 참고 가치 큼 |
| **회의 중 전용 액션 묶음** | Notion | 회의 중 스킬 `Catch me up` / `Suggest questions` / `Recap decisions` 와 회의 후 스킬을 **분리해서 다른 때에 노출** | **적용 가능 (AI 없이도).** "회의 중 모드"와 "정리 모드"에서 보이는 버튼을 다르게 |
| **사용자 사전을 녹음 시작 전에 받는다** | daglo | `Transcription settings → My vocabulary` | 적용 불가(받아쓰기 없음) |
| **키워드 언급 알림** | tl;dv | 등록한 키워드가 언급되면 알림 | 적용 불가(오디오 없음) |
| **회의 시작 전 모달로 5개 필드** | Obsidian Meeting Notes Plus | New Meeting modal: title, date, attendees, type, agenda | **적용 가능.** 회의 중 입력 부담을 회의 전으로 옮기는 가장 단순한 방법 |

### 회의록 구조 관련 후보

| 후보 | 출처 제품 | 내용 | 비고 |
|---|---|---|---|
| **안건을 질문문으로 둔다** | Craft | "Agenda" 가 아니라 **"What outcomes do we want for this meeting?"** | 섹션 이름 하나로 작성 행동을 바꾸는 사례 |
| **목적을 한 문장으로 제한** | Notion 한국어 템플릿(aporigen) | "**목적**: 회의를 진행하는 목적으로 **한 문장으로** 설명해 주세요" | 글자 수 제약을 UI 로 강제하는 아이디어 |
| **주제 제목 + 2단 들여쓰기** | Granola | `•` = 논의 요지, `–` = 그에 딸린 결정·조치 | 고정 섹션 없이 구조를 얻는 방법. **AI 없이도 들여쓰기 규칙만으로 가능** |
| **요약 불릿을 펼쳐 근거 보기** | Fireflies | "Expand specific summary bullet points for additional context" | 접힘/펼침으로 요약↔상세 연결 |
| **회의록을 주제별로 자동 군집** | tl;dv | "clustered by topic" | AI 필요 |
| **회의록 템플릿 섹션 ↔ CRM 필드 매핑** | tl;dv | 템플릿의 각 섹션을 외부 필드에 1:1 대응 | gonote 에는 외부 시스템이 없으나, **"섹션 = 구조화된 슬롯"** 이라는 모델은 참고 |
| **발언 시간 점유율** | Fireflies | Speaker Talk-time 자동 집계 | 적용 불가 |
| **지난 회의의 미완 액션이 다음 회의 안건이 된다** | Otter(Pre-call brief), Obsidian 사용자 워크플로(Reddit) | 액션 아이템이 회의 간에 순환 | **적용 가능.** 로컬 저장만으로 구현 가능하고 개인용에 특히 잘 맞음 |
| **여러 회의를 횡단하는 질문** | Granola(Chat), tl;dv(주간 요약), Fireflies(AskFred), Otter(AI Chat) | "이번 주에 내가 하겠다고 한 것?" | AI 필요. 단 **"담당자=나 인 미완 액션 전체 목록"** 은 AI 없이 가능 |

### 공유·출력 관련 후보

| 후보 | 출처 제품 | 내용 | 비고 |
|---|---|---|---|
| **공유 링크에 비밀번호 + 유효기간(7~180일)** | 클로바노트 | 링크는 비밀번호와 함께 전달, 실패 횟수 초과 시 접근 차단 | gonote 는 서버가 없어 링크 자체가 불가 |
| **시작 시간을 지정한 부분 공유** | 클로바노트 | "공유를 원하는 **시작 시간을 지정**해 해당 부분부터의 노트를 공유" | **발상은 적용 가능**: 특정 섹션부터 / 선택한 항목만 내보내기 |
| **내부용 / 외부용 회의록 분리 + 잠금** | Notion 커뮤니티 템플릿(shared-meeting, Meowdule) | "내부 회의록은 팀원들 사이에서 비밀이 유지되는 반면, 외부 회의록은 외부 관계자와 공유" + 잠금으로 **일부 내용을 제외하고 공유** | **적용 가능하고 매력적.** 같은 회의록에서 **"내보낼 것 / 안 내보낼 것"** 을 항목별로 토글 |
| **체크 안 된 액션만 마스터 노트로 추출** | Obsidian Meeting Notes Plus | `Extract Actions` 명령 | **적용 가능.** AI 없이 성립하는 유일한 "액션 집계" 선례 |
| **회의 종료 시 참석자 전원에게 자동 발송** | tl;dv | 공유가 **기본 동작** | 서버 없이는 불가. 다만 **"끝나면 바로 복사 가능한 상태"** 로 대체 가능 |
| **참석자 목록에서 공유 대상을 고르는 메뉴** | Granola | Share notes 메뉴에 참석자가 나열됨 | 참석자 필드를 공유 UI 와 연결하는 패턴 |
| **오디오 조각(Soundbites) / 영상 클립(Reels) 공유** | Fireflies / tl;dv | 중요 순간만 잘라 공유 | 적용 불가 |
| **회의록을 덱·제안서로 변환** | Supernormal, daglo(AI slides) | 회의록을 최종 산출물의 **입력**으로 | AI 필요 |
| **동의(consent) 를 제품 기능으로** | Notion | 텍스트 동의문 / **음성 자동 재생** / Meet 채팅 자동 공지+고정 / 조직 차원 강제 | gonote 는 녹음을 하지 않으므로 **불필요**. 오히려 "녹음하지 않는다"가 gonote 의 강점 |
| **목록에 액션 개수를 숫자로 표시** | Obsidian Meeting Notes Plus | "recent meetings with title, date, **attendee count, action count**" | **적용 가능.** 목록 화면에서 미완 액션 수를 배지로 |

---

# 부록 — 전체 출처 URL 목록

### 확인한 페이지 (전문 또는 핵심 부분)

| 제품 | URL | 확인 범위 |
|---|---|---|
| 클로바노트 | https://clovanote.naver.com/ | 랜딩 + FAQ 전문 |
| 클로바노트 | https://blog.naver.com/clova_ai/222278631393 | 북마크, 전문 |
| 클로바노트 | https://blog.naver.com/clova_ai/222278517869 | 녹음 중 PC 메모, 전문 |
| 클로바노트 | https://blog.naver.com/clova_ai/222278634257 | 노트 공유, 전문 |
| 클로바노트(기업) | https://help.worksmobile.com/ko/use-guides/clovanote/create/bookmark/ | 본문 확인(페이지 대부분은 네비게이션) |
| 클로바노트 | https://help.naver.com/service/24269/contents/12842?lang=ko | 일부만 확인 |
| 다글로 | https://daglo.ai/ | 랜딩 전문(영문 토글) |
| 카카오워크AI | https://kakaowork.gitbook.io/kakao-work/workservice/ai | 전문 |
| Notion AI Meeting Notes | https://www.notion.com/help/ai-meeting-notes | 도움말 전문 |
| Notion 한국어 템플릿 | https://www.notion.com/ko/templates/category/meetings | 목록 발췌 |
| Notion 한국어 템플릿 | https://www.notion.com/ko/templates/meetingnote | 구조 일부 |
| Notion 한국어 템플릿 | https://www.notion.com/ko/templates/shared-meeting | 설명 전문 |
| Otter.ai | https://otter.ai/ | 랜딩 전문 |
| Fireflies.ai | https://fireflies.ai/ | 랜딩 전문 |
| tl;dv | https://tldv.io/ | 랜딩 전문 |
| tl;dv | https://tldv.io/features/ai-meeting-minutes/ | 기능 페이지 전문 |
| Granola | https://www.granola.ai/ | 랜딩 전문(UI 목업 포함) |
| Fathom | https://www.fathom.ai/ | 랜딩 전문 |
| Fathom | https://help.fathom.video/en/articles/295424 | 도움말 전문 |
| Supernormal | https://www.supernormal.com/ | 랜딩 전문 |
| Obsidian | https://community.obsidian.md/plugins/meeting-notes-plus | 플러그인 소개 전문 |
| Obsidian | https://dannb.org/blog/2023/obsidian-meeting-note-template/ | 템플릿 코드 전문(검색 발췌) |
| Craft | https://www.craft.do/templates/meeting-notes-template | 템플릿 소개 전문 |
| Apple Voice Memos | https://support.apple.com/guide/voice-memos/welcome/mac | 첫 페이지만 |

### 404 였던 URL

- https://www.notion.com/ko/templates/category/meeting-notes → 404 (올바른 슬러그: `/ko/templates/category/meetings`)
- https://www.notion.com/templates/category/meeting-notes → 404

### 확인하지 않은 페이지 (후속 조사 시 우선순위)

| 우선 | URL | 왜 |
|---|---|---|
| 높음 | https://www.granola.ai/voice-typing | Granola 의 입력 UX 신기능. 이 조사 핵심 축 |
| 높음 | https://www.supernormal.com/meeting-notetaker | Supernormal 의 실제 회의록 기능(랜딩이 에이전시용으로 바뀌어 가려짐) |
| 높음 | https://help.fathom.video/en/articles/278720 | custom highlight types 상세 — 북마크 분류 설계 |
| 높음 | Apple 메모(Notes) 공식 문서 | 이번에 전혀 보지 않음 |
| 중간 | https://documents.craft.me/uzOawbwaSTwY5P | Craft 회의록 템플릿 실제 미리보기 |
| 중간 | https://help.otter.ai/ | Otter 의 회의 중 하이라이트 유무 확인 |
| 중간 | https://www.supernormal.com/templates | 템플릿별 섹션 구조 |
| 중간 | https://www.notion.com/ko/help/guides/preserve-perfect-meeting-memory-with-ai-meeting-notes | 한국어 회의록 운영 가이드 |
| 낮음 | https://blog.kakaowork.com/277 , /271 | 카카오의 회의록 취급 방식 |
| 낮음 | https://tldv.io/ko/features/ai-meeting-minutes/ | tl;dv 한국어 번역 용어 |
