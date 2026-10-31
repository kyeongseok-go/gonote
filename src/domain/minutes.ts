// 회의록 문서 모델. **화면에 그리는 쪽과 텍스트로 내보내는 쪽이 이 모델 하나를 읽는다.**
//
// 모델을 둘로 두면 인쇄본과 카톡 텍스트가 서로 다른 회의록이 된다 — 같은 회의의 결정이
// 두 문서에서 다르게 보이는 것이 이 앱에서 가장 나쁜 고장이다.
//
// 전부 순수 함수다. 오늘·지금을 부르지 않는다.
import { clockOf, minutesBetween } from './time'
import type { Agenda, Entry, Meeting, Person } from './types'

/** 안건 밖 줄을 담는 묶음의 이름. 화면과 내보내기가 같은 말을 쓴다. */
export const LOOSE_SECTION_TITLE = '안건 밖 기록'

export interface MinutesSection {
  /** null 이면 안건에 붙지 않은 줄들을 담은 묶음 */
  agenda: Agenda | null
  entries: readonly Entry[]
  /** 이 안건에서 나온 결정만 */
  decisions: readonly Entry[]
  /** 이 안건에서 나온 할 일만 */
  actions: readonly Entry[]
}

export interface AttendanceSummary {
  present: readonly Person[]
  late: readonly Person[]
  absent: readonly Person[]
  /** 참석 + 지참. 성원(정족수) 보고에 쓰는 수다 */
  presentCount: number
  /** 이 회의에 이름이 올라간 사람 수 */
  total: number
}

export interface MinutesDoc {
  meeting: Meeting
  people: Readonly<Record<string, Person>>
  sections: readonly MinutesSection[]
  /** 회의 전체의 결정. 회의록을 받은 사람이 가장 먼저 읽는다 */
  decisions: readonly Entry[]
  /** 회의 전체의 할 일 */
  actions: readonly Entry[]
  attendance: AttendanceSummary
  durationMinutes: number | null
}

export interface BuildMinutesInput {
  meeting: Meeting
  people: Readonly<Record<string, Person>>
  agendas: Readonly<Record<string, Agenda>>
  entries: Readonly<Record<string, Entry>>
}

function sortedEntries(entries: readonly Entry[]): readonly Entry[] {
  // order 가 같으면 적은 시각으로, 그것도 같으면 id 로 — 순서가 들쭉날쭉하지 않게 늘 정해진다.
  return [...entries].sort((a, b) => a.order - b.order || a.at.localeCompare(b.at) || a.id.localeCompare(b.id))
}

function section(agenda: Agenda | null, rows: readonly Entry[]): MinutesSection {
  const entries = sortedEntries(rows)
  return {
    agenda,
    entries,
    decisions: entries.filter((e) => e.kind === 'decision'),
    actions: entries.filter((e) => e.kind === 'action'),
  }
}

/** 회의 하나를 문서 모델로 만든다. */
export function buildMinutes(input: BuildMinutesInput): MinutesDoc {
  const { meeting, people } = input
  const agendas = Object.values(input.agendas)
    .filter((row) => row.meetingId === meeting.id)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
  const entries = Object.values(input.entries).filter((row) => row.meetingId === meeting.id)

  const known = new Set(agendas.map((row) => row.id))
  const sections: MinutesSection[] = agendas.map((agenda) =>
    section(
      agenda,
      entries.filter((row) => row.agendaId === agenda.id),
    ),
  )

  // 안건에 붙지 않은 줄 + 안건이 지워져 떠버린 줄. **줄은 어떤 경우에도 사라지지 않는다.**
  const loose = entries.filter((row) => row.agendaId === null || !known.has(row.agendaId))
  if (loose.length > 0) sections.push(section(null, loose))

  const all = sortedEntries(entries)
  return {
    meeting,
    people,
    sections,
    decisions: all.filter((e) => e.kind === 'decision'),
    actions: all.filter((e) => e.kind === 'action'),
    attendance: attendanceOf(meeting, people),
    durationMinutes: minutesBetween(meeting.openedAt, meeting.closedAt),
  }
}

/** 참석 기록을 상태별로 가른다. 명부에서 사라진 사람은 건너뛴다. */
export function attendanceOf(meeting: Meeting, people: Readonly<Record<string, Person>>): AttendanceSummary {
  const pick = (want: string): Person[] =>
    meeting.attendees
      .filter((row) => row.attendance === want)
      .map((row) => people[row.personId])
      .filter((row): row is Person => row !== undefined)

  const present = pick('present')
  const late = pick('late')
  const absent = pick('absent')
  return {
    present,
    late,
    absent,
    // 지참도 참석이다. 늦게 왔다고 성원에서 빠지지 않는다.
    presentCount: present.length + late.length,
    total: present.length + late.length + absent.length,
  }
}

/**
 * '김영수 장로'. 직분이 없으면 이름만.
 * 교회 명부는 이름 자체를 '김집사' 로 적는 일이 흔하다 — 그때 '김집사 집사' 가 되지 않게 한다.
 */
export function personLabel(person: Person | undefined): string {
  if (!person) return ''
  const role = person.role.trim()
  if (!role || person.name.trim().endsWith(role)) return person.name.trim()
  return `${person.name.trim()} ${role}`
}

/** id 로 바로 이름을 뽑는다. 화면에서 가장 많이 쓰는 꼴이다. */
export function nameOf(people: Readonly<Record<string, Person>>, id: string | null): string {
  if (!id) return ''
  return personLabel(people[id])
}

export function sectionTitle(agenda: Agenda | null): string {
  return agenda ? agenda.title : LOOSE_SECTION_TITLE
}

/** 다음 줄의 정렬 번호. 같은 밀리초에 두 줄이 들어와도 순서가 섞이지 않는다. */
export function nextOrder(entries: Readonly<Record<string, Entry>>, meetingId: string): number {
  const mine = Object.values(entries).filter((row) => row.meetingId === meetingId)
  if (mine.length === 0) return 0
  return Math.max(...mine.map((row) => row.order)) + 1
}

/** 안건의 다음 정렬 번호. */
export function nextAgendaOrder(agendas: Readonly<Record<string, Agenda>>, meetingId: string): number {
  const mine = Object.values(agendas).filter((row) => row.meetingId === meetingId)
  if (mine.length === 0) return 0
  return Math.max(...mine.map((row) => row.order)) + 1
}

/**
 * 회의록 머리와 공유 글이 함께 쓰는 시각 표시.
 *
 * 한쪽만 있을 때 '~01:40' 처럼 적으면 고장처럼 보인다(스크린샷에서 발견).
 * 무엇이 비었는지를 말로 적어 준다.
 */
export function timeLabel(meeting: Meeting): string {
  const open = meeting.openedAt ? clockOf(meeting.openedAt) : ''
  const close = meeting.closedAt ? clockOf(meeting.closedAt) : ''
  if (open && close) return `${open}~${close}`
  if (open) return `${open} 개회`
  if (close) return `${close} 폐회`
  return ''
}
