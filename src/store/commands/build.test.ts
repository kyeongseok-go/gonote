import { describe, expect, test } from 'vitest'
import { newAgenda, newEntry, newMeeting, newPerson, reordered, withAttendance, withoutAttendee } from './build'
import { makeAgenda, makeMeeting } from '../../test/factories'

const NOW = new Date(2026, 10, 1, 10, 30).getTime()
const SETTINGS = { defaultKind: '제직회', defaultPlace: '본당 2층', defaultScribe: '고경석' }

describe('newMeeting', () => {
  test('설정의 기본값을 미리 채운다 — 매번 같은 걸 치지 않게', () => {
    const meeting = newMeeting({ id: 'm1', now: NOW, settings: SETTINGS })

    expect(meeting.kind).toBe('제직회')
    expect(meeting.place).toBe('본당 2층')
    expect(meeting.scribe).toBe('고경석')
  })

  test('제목을 안 주면 달과 회의 종류로 만든다 — 이름 짓느라 회의 시작이 늦어지지 않게', () => {
    const meeting = newMeeting({ id: 'm1', now: NOW, settings: SETTINGS })

    expect(meeting.title).toBe('11월 제직회')
  })

  test('회의 종류도 없으면 날짜로 만든다', () => {
    const meeting = newMeeting({ id: 'm1', now: NOW, settings: { ...SETTINGS, defaultKind: '' } })

    expect(meeting.title).toBe('2026-11-01 회의')
  })

  test('제목을 주면 그걸 쓴다', () => {
    const meeting = newMeeting({ id: 'm1', now: NOW, settings: SETTINGS, title: '  임시 당회  ' })

    expect(meeting.title).toBe('임시 당회')
  })

  test('날짜는 현지 시간대의 오늘이다', () => {
    expect(newMeeting({ id: 'm1', now: NOW, settings: SETTINGS }).date).toBe('2026-11-01')
  })

  test('개회·폐회·녹음 기준은 비어 있다 — 누르기 전에는 없는 것이다', () => {
    const meeting = newMeeting({ id: 'm1', now: NOW, settings: SETTINGS })

    expect(meeting.openedAt).toBeNull()
    expect(meeting.closedAt).toBeNull()
    expect(meeting.recordingStartedAt).toBeNull()
  })
})

describe('newEntry', () => {
  test('종류와 글만으로 만들어진다', () => {
    const entry = newEntry({ id: 'e1', now: NOW, meetingId: 'm1', kind: 'decision', text: '정했다', order: 3 })

    expect(entry.kind).toBe('decision')
    expect(entry.text).toBe('정했다')
    expect(entry.order).toBe(3)
    expect(entry.agendaId).toBeNull()
    expect(entry.speakerId).toBeNull()
  })

  test('앞뒤 공백을 떼어 낸다 — 받아쓰기는 공백을 자주 붙인다', () => {
    const entry = newEntry({ id: 'e1', now: NOW, meetingId: 'm1', kind: 'memo', text: '  적었다  ', order: 0 })

    expect(entry.text).toBe('적었다')
  })

  test('안건과 발언자를 주면 붙는다', () => {
    const entry = newEntry({
      id: 'e1',
      now: NOW,
      meetingId: 'm1',
      kind: 'speech',
      text: '말했다',
      order: 0,
      agendaId: 'a1',
      speakerId: 'p1',
    })

    expect(entry.agendaId).toBe('a1')
    expect(entry.speakerId).toBe('p1')
  })

  test('적은 시각이 남는다 — 녹음에서 그 지점을 찾는 근거다', () => {
    const entry = newEntry({ id: 'e1', now: NOW, meetingId: 'm1', kind: 'memo', text: '글', order: 0 })

    expect(entry.at).toBe(new Date(NOW).toISOString())
  })
})

describe('newAgenda / newPerson', () => {
  test('안건 제목의 공백을 떼어 낸다', () => {
    expect(newAgenda({ id: 'a1', meetingId: 'm1', title: ' 성탄절 ', order: 0 }).title).toBe('성탄절')
  })

  test('사람은 직분 없이도 만들어진다', () => {
    const person = newPerson({ id: 'p1', name: '김영수' })

    expect(person.role).toBe('')
    expect(person.hidden).toBe(false)
  })
})

describe('withAttendance', () => {
  test('없던 사람을 넣는다 — 회의 중에 늦게 온 사람을 바로 넣을 수 있게', () => {
    const next = withAttendance(makeMeeting(), 'p1', 'late')

    expect(next.attendees).toEqual([{ personId: 'p1', attendance: 'late' }])
  })

  test('있던 사람의 상태만 바꾼다', () => {
    const before = withAttendance(makeMeeting(), 'p1', 'absent')

    const next = withAttendance(before, 'p1', 'present')

    expect(next.attendees).toEqual([{ personId: 'p1', attendance: 'present' }])
  })

  test('원본을 바꾸지 않는다', () => {
    const before = makeMeeting({ attendees: [{ personId: 'p1', attendance: 'absent' }] })

    withAttendance(before, 'p1', 'present')

    expect(before.attendees[0].attendance).toBe('absent')
  })

  test('순서를 지킨다 — 참석자 목록이 누를 때마다 뒤섞이면 못 쓴다', () => {
    let meeting = makeMeeting()
    meeting = withAttendance(meeting, 'p1', 'present')
    meeting = withAttendance(meeting, 'p2', 'present')
    meeting = withAttendance(meeting, 'p1', 'absent')

    expect(meeting.attendees.map((row) => row.personId)).toEqual(['p1', 'p2'])
  })
})

describe('withoutAttendee', () => {
  test('참석 기록에서 뺀다', () => {
    const before = withAttendance(makeMeeting(), 'p1', 'present')

    expect(withoutAttendee(before, 'p1').attendees).toEqual([])
  })
})

describe('reordered', () => {
  const agendas = [
    makeAgenda({ id: 'a1', title: '첫째', order: 0 }),
    makeAgenda({ id: 'a2', title: '둘째', order: 1 }),
    makeAgenda({ id: 'a3', title: '셋째', order: 2 }),
  ]

  test('맨 앞으로 옮긴다', () => {
    const next = reordered(agendas, 'a3', 0)

    expect(next.map((row) => row.id)).toEqual(['a3', 'a1', 'a2'])
  })

  test('맨 뒤로 옮긴다', () => {
    const next = reordered(agendas, 'a1', 2)

    expect(next.map((row) => row.id)).toEqual(['a2', 'a3', 'a1'])
  })

  test('번호를 0 부터 다시 매긴다 — 소수점으로 끼워 넣지 않는다', () => {
    const next = reordered(agendas, 'a3', 1)

    expect(next.map((row) => row.order)).toEqual([0, 1, 2])
  })

  test('범위를 넘는 자리로 옮기면 끝으로 간다', () => {
    const next = reordered(agendas, 'a1', 99)

    expect(next.map((row) => row.id)).toEqual(['a2', 'a3', 'a1'])
  })

  test('없는 안건을 옮기라고 하면 순서만 정리한다', () => {
    const next = reordered(agendas, '없음', 0)

    expect(next.map((row) => row.id)).toEqual(['a1', 'a2', 'a3'])
  })

  test('원본을 바꾸지 않는다', () => {
    reordered(agendas, 'a3', 0)

    expect(agendas.map((row) => row.order)).toEqual([0, 1, 2])
  })
})
