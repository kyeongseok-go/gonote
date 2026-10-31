// 테스트용 공장. 모델에 필드가 늘어도 테스트를 전부 고치지 않게 한곳에서 만든다.
import type { Agenda, Entry, Meeting, Person } from '../domain/types'

export function makeMeeting(partial: Partial<Meeting> = {}): Meeting {
  return {
    id: 'm1',
    title: '11월 제직회',
    kind: '제직회',
    date: '2026-11-01',
    place: '본당 2층 회의실',
    scribe: '고경석',
    attendees: [],
    openedAt: null,
    closedAt: null,
    recordingStartedAt: null,
    nextMeetingNote: '',
    createdAt: '2026-11-01T01:00:00.000Z',
    ...partial,
  }
}

export function makePerson(partial: Partial<Person> = {}): Person {
  return { id: 'p1', name: '김집사', role: '집사', hidden: false, ...partial }
}

export function makeAgenda(partial: Partial<Agenda> = {}): Agenda {
  return { id: 'a1', meetingId: 'm1', title: '성탄절 준비', order: 0, result: null, ...partial }
}

export function makeEntry(partial: Partial<Entry> = {}): Entry {
  return {
    id: 'e1',
    meetingId: 'm1',
    agendaId: null,
    kind: 'speech',
    speakerId: null,
    text: '첫 줄',
    at: '2026-11-01T01:00:00.000Z',
    order: 0,
    assigneeId: null,
    assigneeText: '',
    due: null,
    done: false,
    moverId: null,
    seconderId: null,
    vote: { for: null, against: null, abstain: null },
    result: null,
    ...partial,
  }
}
