// 모든 데이터 모델. 3단계에서 동결한다. 모자라면 명시적으로 열고 한 번에 고친다.
//
// 설계의 중심: **회의는 기다려 주지 않는다.**
// 그래서 한 줄을 넣는 데 필요한 정보를 최소로 줄였다 — 종류와 글만 있으면 들어간다.
// 발언자·안건·시각·담당·기한은 전부 **나중에 붙일 수 있고**, 비어 있어도 회의록이 나온다.
// 회의 중에 필수 입력을 요구하는 앱은 회의 중에 안 쓰인다.

/** 'YYYY-MM-DD' */
export type DayKey = string

/**
 * 한 줄의 종류. **결정과 할 일이 이 앱의 존재 이유다.**
 * 회의록을 받은 사람이 실제로 읽는 건 그 두 가지뿐이다.
 */
export type EntryKind = 'speech' | 'decision' | 'action' | 'report' | 'memo'

export const ENTRY_KINDS: readonly EntryKind[] = ['speech', 'decision', 'action', 'report', 'memo']

export const ENTRY_LABELS: Readonly<Record<EntryKind, string>> = {
  speech: '발언',
  decision: '결정',
  action: '할 일',
  report: '보고',
  memo: '메모',
}

/**
 * 입력창에 띄우는 안내. 무엇을 적어야 하는지 모르면 손이 멈춘다.
 *
 * 결정의 안내가 '~하기로 가결하다' 인 것은 교단 규정의 문장 투다 —
 * 고신총회 회의록 작성법 17항은 부결도 "기각하기로 가결하다" 로 적게 한다.
 * **회의가 무엇을 결의했는지**를 주어로 삼는 문법이다(research/refs-church.md).
 */
export const ENTRY_HINTS: Readonly<Record<EntryKind, string>> = {
  speech: '누가 무슨 말을 했는지',
  decision: '… 하기로 가결하다',
  action: '누가 언제까지 무엇을',
  report: '보고된 사실·숫자',
  memo: '나만 보는 메모 (회의록에 안 나가요)',
}

/** 회의법의 표결 결과. 격식 없는 회의에서는 비워 둔다. */
export type VoteResult = 'passed' | 'rejected' | 'tabled' | 'unanimous'

export const VOTE_LABELS: Readonly<Record<VoteResult, string>> = {
  passed: '가결',
  rejected: '부결',
  tabled: '유안',
  unanimous: '만장일치 가결',
}

/** 참석 상태. 교회 회의록은 성원(정족수) 보고를 위해 이걸 센다. */
export type Attendance = 'present' | 'absent' | 'late'

export const ATTENDANCE_LABELS: Readonly<Record<Attendance, string>> = {
  present: '참석',
  absent: '불참',
  late: '지참',
}

/**
 * 사람. 회의마다 다시 입력하지 않게 **명부로 따로 둔다.**
 * 교회 회의는 같은 사람들이 매달 모인다 — 매번 10명을 치게 만들면 두 번째 회의부터 안 쓴다.
 */
export interface Person {
  id: string
  name: string
  /** 직분. '장로', '집사', '권사', '목사' 등. 비워도 된다 */
  role: string
  /** 명부에서 숨긴 사람. 지우지 않는다 — 지난 회의록의 발언자가 사라지면 안 된다 */
  hidden: boolean
}

/** 한 회의에서 한 사람의 참석 기록. */
export interface Attendee {
  personId: string
  attendance: Attendance
}

export interface Meeting {
  id: string
  /** '11월 제직회' 처럼 사람이 읽는 이름 */
  title: string
  /** 회의 종류. '제직회', '당회', '부서 회의' 등 */
  kind: string
  /** 'YYYY-MM-DD' */
  date: DayKey
  place: string
  /** 서기(이 회의록을 쓴 사람) */
  scribe: string
  attendees: readonly Attendee[]
  /** 개회·폐회 시각 ISO. 비어 있을 수 있다 */
  openedAt: string | null
  closedAt: string | null
  /**
   * 폰 음성 메모 녹음을 시작한 시각 ISO.
   * 이 값이 있으면 모든 줄에 **녹음 기준 경과 시간**이 붙어, 나중에 그 지점을 바로 찾을 수 있다.
   * 브라우저 녹음을 1순위에 두지 않는 이유는 HANDOFF 에 있다.
   */
  recordingStartedAt: string | null
  /** 다음 회의 예정. 비워도 된다 */
  nextMeetingNote: string
  createdAt: string
}

/** 안건. 회의록의 본문은 안건 단위로 묶인다. */
export interface Agenda {
  id: string
  meetingId: string
  title: string
  /** 정렬 순서. 끌어서 바꾼다 */
  order: number
  /** 이 안건이 어떻게 끝났나. 비어 있으면 아직 논의 중 */
  result: VoteResult | null
}

/** 표결 수. 비어 있는 필드는 '세지 않았다'는 뜻이다 — 0 과 다르다. */
export interface VoteCount {
  for: number | null
  against: number | null
  abstain: number | null
}

/**
 * 회의록의 한 줄. 이 앱에서 가장 많이 만들어지는 것이다.
 *
 * `kind` 에 따라 쓰이는 필드가 다르지만 **한 타입으로 둔다** — 회의 중에 종류를 바꾸는 일이
 * 흔하고(발언이라 적었는데 결정이었다), 타입이 갈라져 있으면 그때 줄을 다시 만들어야 한다.
 */
export interface Entry {
  id: string
  meetingId: string
  /** 어느 안건에 속하나. null 이면 안건 밖(개회 인사, 잡담, 잘못 들어온 줄) */
  agendaId: string | null
  kind: EntryKind
  /** 누가. null 이면 지정 안 함 — 회의 중에는 비워 두고 나중에 붙이는 일이 많다 */
  speakerId: string | null
  text: string
  /** 적은 시각 ISO */
  at: string
  /** 정렬 순서. 같은 시각에 여러 줄이 들어와도 순서가 섞이지 않게 */
  order: number

  // --- kind === 'action' 일 때만 쓴다 ---
  /** 담당자. 명부에 없는 사람(외부인·부서 전체)은 `assigneeText` 에 적는다 */
  assigneeId: string | null
  assigneeText: string
  /** 기한 'YYYY-MM-DD'. 비워도 된다 */
  due: DayKey | null
  done: boolean

  // --- kind === 'decision' 일 때만 쓴다 (교회 회의법) ---
  /** 동의한 사람 */
  moverId: string | null
  /** 재청한 사람 */
  seconderId: string | null
  vote: VoteCount
  result: VoteResult | null
}

/**
 * 짧은 구간 녹음. **보조 기능이다.**
 * Blob 이라 변경 집합·내보내기에 넣지 않는다(용량). 회의 하나에 여러 개 붙을 수 있다.
 */
export interface Clip {
  id: string
  meetingId: string
  /** 어느 줄에 붙은 녹음인가. null 이면 회의 전체에 붙은 것 */
  entryId: string | null
  blob: Blob
  mime: string
  /** 길이(ms). 재생 전에 보여 준다 */
  durationMs: number
  createdAt: number
}

export type ThemeChoice = 'auto' | 'light' | 'dark'

export interface Settings {
  /** Dexie 키. 행은 늘 하나다 */
  id: 'settings'
  theme: ThemeChoice
  /** 새 회의를 만들 때 미리 채워 둘 값들. 매번 같은 걸 치지 않게 */
  defaultKind: string
  defaultPlace: string
  defaultScribe: string
  /** 카톡용 텍스트에 발언까지 넣을까. 기본은 결정·할 일만 — 그게 읽힌다 */
  shareIncludesSpeech: boolean
  /**
   * 공유 글에서 발언자 이름을 직분으로 바꿀까.
   * 회의록 원본(인쇄·PDF)은 늘 실명이다 — 이 스위치는 **공유 글에만** 걸린다.
   */
  shareHidesNames: boolean
}
