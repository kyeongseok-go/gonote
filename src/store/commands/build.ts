// 새 행을 만드는 순수 함수들. **id 와 지금을 인자로 받는다** — 저장소가 넣어 준다.
// 그래서 "줄을 만들면 이런 모양이 된다" 를 저장소나 시간 모킹 없이 테스트할 수 있다.
import type { Agenda, Attendance, Entry, EntryKind, Meeting, Person, Settings } from '../../domain/types'
import { dayKeyOf, isoOf } from '../../domain/time'

export interface NewMeetingInput {
  id: string
  now: number
  settings: Pick<Settings, 'defaultKind' | 'defaultPlace' | 'defaultScribe'>
  title?: string
}

/**
 * 새 회의. **설정의 기본값을 미리 채운다** — 교회 회의는 종류·장소·서기가 매번 같다.
 * 제목을 안 주면 날짜로 만든다(이름 짓느라 회의 시작이 늦어지지 않게).
 */
export function newMeeting(input: NewMeetingInput): Meeting {
  const date = dayKeyOf(input.now)
  const kind = input.settings.defaultKind.trim()
  const fallback = kind ? `${Number(date.slice(5, 7))}월 ${kind}` : `${date} 회의`
  return {
    id: input.id,
    title: (input.title ?? '').trim() || fallback,
    kind,
    date,
    place: input.settings.defaultPlace,
    scribe: input.settings.defaultScribe,
    attendees: [],
    openedAt: null,
    closedAt: null,
    recordingStartedAt: null,
    nextMeetingNote: '',
    createdAt: isoOf(input.now),
  }
}

export interface NewEntryInput {
  id: string
  now: number
  meetingId: string
  kind: EntryKind
  text: string
  order: number
  agendaId?: string | null
  speakerId?: string | null
}

/** 회의록의 한 줄. 종류와 글만 있으면 만들어진다 — 나머지는 나중에 붙인다. */
export function newEntry(input: NewEntryInput): Entry {
  return {
    id: input.id,
    meetingId: input.meetingId,
    agendaId: input.agendaId ?? null,
    kind: input.kind,
    speakerId: input.speakerId ?? null,
    text: input.text.trim(),
    at: isoOf(input.now),
    order: input.order,
    assigneeId: null,
    assigneeText: '',
    due: null,
    done: false,
    moverId: null,
    seconderId: null,
    vote: { for: null, against: null, abstain: null },
    result: null,
  }
}

export function newAgenda(input: { id: string; meetingId: string; title: string; order: number }): Agenda {
  return {
    id: input.id,
    meetingId: input.meetingId,
    title: input.title.trim(),
    order: input.order,
    result: null,
  }
}

export function newPerson(input: { id: string; name: string; role?: string }): Person {
  return { id: input.id, name: input.name.trim(), role: (input.role ?? '').trim(), hidden: false }
}

/**
 * 참석 상태를 바꾼 회의를 돌려준다. 원본을 바꾸지 않는다.
 * 명부에 없던 사람이면 새로 더한다 — 회의 중에 늦게 온 사람을 바로 넣을 수 있어야 한다.
 */
export function withAttendance(meeting: Meeting, personId: string, attendance: Attendance): Meeting {
  const known = meeting.attendees.some((row) => row.personId === personId)
  const attendees = known
    ? meeting.attendees.map((row) => (row.personId === personId ? { ...row, attendance } : row))
    : [...meeting.attendees, { personId, attendance }]
  return { ...meeting, attendees }
}

/** 참석 기록에서 뺀다(잘못 넣은 사람). */
export function withoutAttendee(meeting: Meeting, personId: string): Meeting {
  return { ...meeting, attendees: meeting.attendees.filter((row) => row.personId !== personId) }
}

/**
 * 안건 순서를 다시 매긴다. 끌어서 옮긴 뒤 **전체를 0부터 다시 번호 매긴다** —
 * 번호 사이에 끼워 넣는 방식은 몇 번 옮기면 소수점이 되고, 그때 순서가 무너진다.
 */
export function reordered(agendas: readonly Agenda[], fromId: string, toIndex: number): Agenda[] {
  const sorted = [...agendas].sort((a, b) => a.order - b.order)
  const at = sorted.findIndex((row) => row.id === fromId)
  if (at < 0) return sorted.map((row, index) => ({ ...row, order: index }))

  const moving = sorted[at]
  const rest = sorted.filter((row) => row.id !== fromId)
  const target = Math.max(0, Math.min(toIndex, rest.length))
  const next = [...rest.slice(0, target), moving, ...rest.slice(target)]
  return next.map((row, index) => ({ ...row, order: index }))
}
