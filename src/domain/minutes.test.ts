import { describe, expect, test } from 'vitest'
import { buildMinutes, nextOrder, personLabel, sectionTitle, timeLabel } from './minutes'
import { makeAgenda, makeEntry, makeMeeting, makePerson } from '../test/factories'
import type { Agenda, Entry, Person } from './types'

function byId<T extends { id: string }>(rows: readonly T[]): Record<string, T> {
  return Object.fromEntries(rows.map((row) => [row.id, row]))
}

const people: Person[] = [
  makePerson({ id: 'p1', name: '김영수', role: '장로' }),
  makePerson({ id: 'p2', name: '박미경', role: '권사' }),
  makePerson({ id: 'p3', name: '이준호', role: '집사' }),
]

function build(agendas: Agenda[], entries: Entry[], meetingPatch = {}) {
  return buildMinutes({
    meeting: makeMeeting({
      attendees: [
        { personId: 'p1', attendance: 'present' },
        { personId: 'p2', attendance: 'late' },
        { personId: 'p3', attendance: 'absent' },
      ],
      ...meetingPatch,
    }),
    people: byId(people),
    agendas: byId(agendas),
    entries: byId(entries),
  })
}

describe('buildMinutes — 안건 묶기', () => {
  test('안건 순서대로 묶인다', () => {
    const doc = build(
      [makeAgenda({ id: 'a2', title: '두 번째', order: 1 }), makeAgenda({ id: 'a1', title: '첫 번째', order: 0 })],
      [
        makeEntry({ id: 'e1', agendaId: 'a2', text: '두 번째 줄', order: 1 }),
        makeEntry({ id: 'e2', agendaId: 'a1', text: '첫 번째 줄', order: 0 }),
      ],
    )

    expect(doc.sections.map((s) => s.agenda?.title)).toEqual(['첫 번째', '두 번째'])
  })

  test('안건 안의 줄은 적은 순서대로다', () => {
    const doc = build(
      [makeAgenda({ id: 'a1' })],
      [
        makeEntry({ id: 'e2', agendaId: 'a1', text: '나중', order: 5 }),
        makeEntry({ id: 'e1', agendaId: 'a1', text: '먼저', order: 1 }),
      ],
    )

    expect(doc.sections[0].entries.map((e) => e.text)).toEqual(['먼저', '나중'])
  })

  test('안건에 안 붙은 줄은 맨 뒤 묶음으로 간다 — 회의록에서 잡담이 앞에 오면 안 된다', () => {
    const doc = build(
      [makeAgenda({ id: 'a1', title: '성탄절 준비' })],
      [
        makeEntry({ id: 'e1', agendaId: null, text: '개회 인사', order: 0 }),
        makeEntry({ id: 'e2', agendaId: 'a1', text: '예산 이야기', order: 1 }),
      ],
    )

    expect(doc.sections).toHaveLength(2)
    expect(doc.sections[0].agenda?.title).toBe('성탄절 준비')
    expect(doc.sections[1].agenda).toBeNull()
    expect(doc.sections[1].entries.map((e) => e.text)).toEqual(['개회 인사'])
  })

  test('안건 밖 줄이 없으면 그 묶음을 만들지 않는다', () => {
    const doc = build([makeAgenda({ id: 'a1' })], [makeEntry({ id: 'e1', agendaId: 'a1' })])

    expect(doc.sections).toHaveLength(1)
  })

  test('줄이 가리키는 안건이 지워졌으면 안건 밖으로 떨어진다 — 줄이 사라지지 않는다', () => {
    const doc = build([], [makeEntry({ id: 'e1', agendaId: '없는안건', text: '남아야 한다' })])

    expect(doc.sections[0].agenda).toBeNull()
    expect(doc.sections[0].entries.map((e) => e.text)).toEqual(['남아야 한다'])
  })

  test('줄이 없는 안건도 회의록에 남는다 — 다루지 못한 안건이 보여야 한다', () => {
    const doc = build([makeAgenda({ id: 'a1', title: '다음에 다룸' })], [])

    expect(doc.sections).toHaveLength(1)
    expect(doc.sections[0].entries).toEqual([])
  })

  test('다른 회의의 줄과 안건은 섞이지 않는다', () => {
    const doc = build(
      [makeAgenda({ id: 'a1' }), makeAgenda({ id: 'aX', meetingId: '다른회의', title: '남의 안건' })],
      [makeEntry({ id: 'e1', agendaId: 'a1' }), makeEntry({ id: 'eX', meetingId: '다른회의', text: '남의 줄' })],
    )

    expect(doc.sections).toHaveLength(1)
    expect(doc.sections[0].entries).toHaveLength(1)
  })
})

describe('buildMinutes — 결정과 할 일', () => {
  const entries = [
    makeEntry({ id: 'e1', agendaId: 'a1', kind: 'speech', text: '논의했다', order: 0 }),
    makeEntry({ id: 'e2', agendaId: 'a1', kind: 'decision', text: '예산 50만원으로 정함', order: 1 }),
    makeEntry({ id: 'e3', agendaId: 'a1', kind: 'action', text: '현수막 주문', assigneeId: 'p1', order: 2 }),
    makeEntry({ id: 'e4', agendaId: null, kind: 'decision', text: '다음 회의 11월 8일', order: 3 }),
  ]

  test('회의 전체의 결정을 한곳에 모은다 — 사람들이 읽는 건 이것이다', () => {
    const doc = build([makeAgenda({ id: 'a1' })], entries)

    expect(doc.decisions.map((e) => e.text)).toEqual(['예산 50만원으로 정함', '다음 회의 11월 8일'])
  })

  test('할 일도 한곳에 모은다', () => {
    const doc = build([makeAgenda({ id: 'a1' })], entries)

    expect(doc.actions.map((e) => e.text)).toEqual(['현수막 주문'])
  })

  test('안건 묶음에도 그 안건의 결정·할 일이 따로 담긴다', () => {
    const doc = build([makeAgenda({ id: 'a1' })], entries)

    expect(doc.sections[0].decisions).toHaveLength(1)
    expect(doc.sections[0].actions).toHaveLength(1)
  })

  test('결정도 할 일도 없으면 빈 배열이다', () => {
    const doc = build([], [makeEntry({ id: 'e1', kind: 'memo' })])

    expect(doc.decisions).toEqual([])
    expect(doc.actions).toEqual([])
  })
})

describe('buildMinutes — 참석', () => {
  test('참석·지참·불참으로 나눈다', () => {
    const doc = build([], [])

    expect(doc.attendance.present.map((p) => p.name)).toEqual(['김영수'])
    expect(doc.attendance.late.map((p) => p.name)).toEqual(['박미경'])
    expect(doc.attendance.absent.map((p) => p.name)).toEqual(['이준호'])
  })

  test('지참은 참석으로 센다 — 성원 보고에 들어가야 한다', () => {
    const doc = build([], [])

    expect(doc.attendance.presentCount).toBe(2)
    expect(doc.attendance.total).toBe(3)
  })

  test('명부에서 지워진 사람은 건너뛴다 — 회의록이 터지지 않게', () => {
    const doc = build([], [], { attendees: [{ personId: '없는사람', attendance: 'present' }] })

    expect(doc.attendance.present).toEqual([])
    expect(doc.attendance.total).toBe(0)
  })
})

describe('buildMinutes — 걸린 시간', () => {
  test('개회와 폐회가 있으면 분을 센다', () => {
    const doc = build([], [], {
      openedAt: new Date(2026, 10, 1, 10, 0).toISOString(),
      closedAt: new Date(2026, 10, 1, 11, 20).toISOString(),
    })

    expect(doc.durationMinutes).toBe(80)
  })

  test('폐회하지 않았으면 셀 수 없다', () => {
    const doc = build([], [])

    expect(doc.durationMinutes).toBeNull()
  })
})

describe('personLabel', () => {
  test('이름과 직분을 붙인다', () => {
    expect(personLabel(makePerson({ name: '김영수', role: '장로' }))).toBe('김영수 장로')
  })

  test('직분이 없으면 이름만', () => {
    expect(personLabel(makePerson({ name: '김영수', role: '' }))).toBe('김영수')
  })

  test('이름이 이미 직분으로 끝나면 겹쳐 쓰지 않는다 — "김집사 집사" 가 되지 않게', () => {
    expect(personLabel(makePerson({ name: '김집사', role: '집사' }))).toBe('김집사')
  })

  test('사람이 없으면 빈 문자열', () => {
    expect(personLabel(undefined)).toBe('')
  })
})

describe('sectionTitle', () => {
  test('안건이 있으면 안건 제목', () => {
    expect(sectionTitle(makeAgenda({ title: '성탄절 준비' }))).toBe('성탄절 준비')
  })

  test('안건 밖 묶음에는 고정된 이름을 쓴다', () => {
    expect(sectionTitle(null)).toBe('안건 밖 기록')
  })
})

describe('nextOrder', () => {
  test('가장 큰 순서 다음 번호를 준다', () => {
    const entries = byId([makeEntry({ id: 'e1', order: 0 }), makeEntry({ id: 'e2', order: 7 })])

    expect(nextOrder(entries, 'm1')).toBe(8)
  })

  test('줄이 없으면 0 에서 시작한다', () => {
    expect(nextOrder({}, 'm1')).toBe(0)
  })

  test('다른 회의의 줄은 세지 않는다', () => {
    const entries = byId([makeEntry({ id: 'eX', meetingId: '다른회의', order: 99 })])

    expect(nextOrder(entries, 'm1')).toBe(0)
  })
})

describe('timeLabel', () => {
  const open = new Date(2026, 10, 1, 10, 0).toISOString()
  const close = new Date(2026, 10, 1, 11, 20).toISOString()

  test('개회와 폐회가 다 있으면 범위로 적는다', () => {
    expect(timeLabel(makeMeeting({ openedAt: open, closedAt: close }))).toBe('10:00~11:20')
  })

  test('개회만 있으면 개회라고 적는다', () => {
    expect(timeLabel(makeMeeting({ openedAt: open }))).toBe('10:00 개회')
  })

  test('폐회만 있으면 폐회라고 적는다 — "~01:40" 처럼 적으면 고장처럼 보인다', () => {
    expect(timeLabel(makeMeeting({ closedAt: close }))).toBe('11:20 폐회')
  })

  test('둘 다 없으면 빈 문자열', () => {
    expect(timeLabel(makeMeeting())).toBe('')
  })
})
