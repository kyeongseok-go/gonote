import { describe, expect, test } from 'vitest'
import { buildMinutes } from './minutes'
import { fileNameOf, shareText, summaryText } from './share'
import { makeAgenda, makeEntry, makeMeeting, makePerson } from '../test/factories'
import type { Agenda, Entry, Person } from './types'

function byId<T extends { id: string }>(rows: readonly T[]): Record<string, T> {
  return Object.fromEntries(rows.map((row) => [row.id, row]))
}

const people: Person[] = [
  makePerson({ id: 'p1', name: '김영수', role: '장로' }),
  makePerson({ id: 'p2', name: '박미경', role: '권사' }),
]

function doc(agendas: Agenda[], entries: Entry[], meetingPatch = {}) {
  return buildMinutes({
    meeting: makeMeeting({
      openedAt: new Date(2026, 10, 1, 10, 0).toISOString(),
      closedAt: new Date(2026, 10, 1, 11, 20).toISOString(),
      attendees: [
        { personId: 'p1', attendance: 'present' },
        { personId: 'p2', attendance: 'absent' },
      ],
      ...meetingPatch,
    }),
    people: byId(people),
    agendas: byId(agendas),
    entries: byId(entries),
  })
}

const AGENDAS = [makeAgenda({ id: 'a1', title: '성탄절 준비', order: 0 })]
const ENTRIES = [
  makeEntry({ id: 'e1', agendaId: 'a1', kind: 'speech', speakerId: 'p1', text: '작년보다 인원이 늘 것 같아요', order: 0 }),
  makeEntry({ id: 'e2', agendaId: 'a1', kind: 'decision', text: '예산 50만원으로 한다', result: 'unanimous', order: 1 }),
  makeEntry({
    id: 'e3',
    agendaId: 'a1',
    kind: 'action',
    text: '현수막 주문',
    assigneeId: 'p1',
    due: '2026-11-08',
    order: 2,
  }),
]

describe('shareText — 카톡에 붙이는 글', () => {
  const text = shareText(doc(AGENDAS, ENTRIES), { includeSpeech: true })

  test('회의 이름과 날짜가 맨 위에 온다', () => {
    const lines = text.split('\n')

    expect(lines[0]).toContain('11월 제직회')
    expect(lines[1]).toContain('2026년 11월 1일 (일)')
  })

  test('회의 시각과 장소가 들어간다', () => {
    expect(text).toContain('10:00~11:20')
    expect(text).toContain('본당 2층 회의실')
  })

  test('참석 수를 적는다 — 성원 보고다', () => {
    expect(text).toContain('참석 1/2')
  })

  test('결정 사항이 할 일보다 먼저 온다 — 사람들이 읽는 순서다', () => {
    expect(text.indexOf('결정 사항')).toBeLessThan(text.indexOf('할 일'))
  })

  test('결정에 번호를 붙인다 — 카톡에서 "2번 말씀인데요" 라고 가리킬 수 있게', () => {
    expect(text).toContain('1. 예산 50만원으로 한다')
  })

  test('표결 결과를 결정 뒤에 붙인다', () => {
    expect(text).toContain('(만장일치 가결)')
  })

  test('할 일에 담당자와 기한이 붙는다', () => {
    expect(text).toContain('현수막 주문')
    expect(text).toContain('김영수 장로')
    expect(text).toContain('11월 8일')
  })

  test('발언을 넣으면 안건별 기록이 따라온다', () => {
    expect(text).toContain('성탄절 준비')
    expect(text).toContain('김영수 장로: 작년보다 인원이 늘 것 같아요')
  })

  test('발언을 끄면 안건별 기록이 빠지고 결정·할 일만 남는다', () => {
    const short = shareText(doc(AGENDAS, ENTRIES), { includeSpeech: false })

    expect(short).not.toContain('작년보다 인원이 늘 것 같아요')
    expect(short).toContain('예산 50만원으로 한다')
  })

  test('서기 이름으로 끝난다', () => {
    expect(text.trimEnd().endsWith('작성 고경석')).toBe(true)
  })

  test('마크다운 기호를 쓰지 않는다 — 카톡은 마크다운을 렌더링하지 않는다', () => {
    expect(text).not.toMatch(/\*\*|^#{1,6} |^- /m)
  })

  test('빈 줄이 세 줄 이상 이어지지 않는다', () => {
    expect(text).not.toMatch(/\n{3}/)
  })
})

describe('shareText — 내부용 메모는 나가지 않는다', () => {
  test('메모 줄은 공유 글에 들어가지 않는다 — 서기가 자기만 보려고 적은 것이다', () => {
    const text = shareText(
      doc(AGENDAS, [
        ...ENTRIES,
        makeEntry({ id: 'e9', agendaId: 'a1', kind: 'memo', text: '이 분 말이 너무 길다', order: 9 }),
      ]),
      { includeSpeech: true },
    )

    expect(text).not.toContain('이 분 말이 너무 길다')
    expect(text).toContain('작년보다 인원이 늘 것 같아요')
  })

  test('메모만 있는 안건은 공유 글에서 아예 빠진다', () => {
    const text = shareText(
      doc([makeAgenda({ id: 'a1', title: '비공개 안건' })], [makeEntry({ id: 'e1', agendaId: 'a1', kind: 'memo', text: '혼자 메모' })]),
      { includeSpeech: true },
    )

    expect(text).not.toContain('비공개 안건')
    expect(text).not.toContain('혼자 메모')
  })
})

describe('shareText — 비어 있을 때', () => {
  test('결정이 없으면 없다고 적는다 — 섹션만 비어 있으면 빠뜨린 것처럼 보인다', () => {
    const text = shareText(doc([], []), { includeSpeech: true })

    expect(text).toContain('결정된 사항 없음')
  })

  test('할 일이 없으면 그 묶음을 적지 않는다', () => {
    const text = shareText(doc([], [makeEntry({ id: 'e1', kind: 'decision', text: '정했다' })]), {
      includeSpeech: false,
    })

    expect(text).not.toContain('할 일')
  })

  test('폐회하지 않았으면 시작 시각만 적는다', () => {
    const text = shareText(doc([], []), { includeSpeech: false })
    const open = shareText(doc([], [], { closedAt: null }), { includeSpeech: false })

    expect(text).toContain('~')
    expect(open).toContain('10:00')
    expect(open).not.toContain('~')
  })

  test('장소가 비면 장소를 적지 않는다', () => {
    const text = shareText(doc([], [], { place: '' }), { includeSpeech: false })

    expect(text).not.toContain(' · 참석')
    expect(text).toContain('참석')
  })
})

describe('summaryText — 결정과 할 일만', () => {
  test('결정과 할 일만 담는다', () => {
    const text = summaryText(doc(AGENDAS, ENTRIES))

    expect(text).toContain('예산 50만원으로 한다')
    expect(text).toContain('현수막 주문')
    expect(text).not.toContain('작년보다 인원이 늘 것 같아요')
  })

  test('회의 이름은 남긴다 — 어느 회의인지 모르면 못 쓴다', () => {
    expect(summaryText(doc(AGENDAS, ENTRIES))).toContain('11월 제직회')
  })
})

describe('fileNameOf', () => {
  test('날짜와 회의 이름으로 파일 이름을 만든다', () => {
    expect(fileNameOf(makeMeeting())).toBe('2026-11-01_11월 제직회')
  })

  test('파일 이름에 쓸 수 없는 글자를 치운다', () => {
    const name = fileNameOf(makeMeeting({ title: '제직회/임시 : 11월?' }))

    expect(name).toBe('2026-11-01_제직회-임시 - 11월')
  })

  test('이름이 비면 날짜만 쓴다', () => {
    expect(fileNameOf(makeMeeting({ title: '  ' }))).toBe('2026-11-01_회의록')
  })
})
