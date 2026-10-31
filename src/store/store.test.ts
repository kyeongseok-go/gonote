import { beforeEach, describe, expect, test } from 'vitest'
import { GonoteDB } from '../db/db'
import { createAppStore } from './store'
import type { AppStore } from './store'

let db: GonoteDB
let store: AppStore
let count = 0

// 지금을 고정한다. 저장소가 시간을 인자로 받으므로 모킹이 필요 없다.
const NOW = new Date(2026, 10, 1, 10, 0).getTime()
let clock = NOW
const now = () => clock

beforeEach(async () => {
  count += 1
  clock = NOW
  db = new GonoteDB(`gonote-test-${count}`)
  store = createAppStore(db, now)
  await store.getState().load()
})

function state() {
  return store.getState()
}

describe('load', () => {
  test('처음 열면 비어 있고 준비된다', () => {
    expect(state().ready).toBe(true)
    expect(Object.keys(state().entities.meetings)).toEqual([])
  })

  test('설정 기본값이 저장된다', async () => {
    await state().settled()

    const stored = await db.settings.get('settings')
    expect(stored?.shareIncludesSpeech).toBe(false)
  })

  test('두 번 불러도 한 번만 읽는다', async () => {
    const first = state().load()
    const second = state().load()

    expect(first).toBe(second)
    await first
  })
})

describe('createMeeting', () => {
  test('회의를 만들면 메모리와 DB 에 함께 들어간다', async () => {
    const meeting = state().createMeeting()
    await state().settled()

    expect(state().entities.meetings[meeting.id].title).toBe('2026-11-01 회의')
    expect(await db.meetings.get(meeting.id)).toBeDefined()
  })

  test('설정의 기본값이 새 회의에 들어간다', async () => {
    state().updateSettings({ defaultKind: '제직회', defaultPlace: '본당', defaultScribe: '고경석' })

    const meeting = state().createMeeting()

    expect(meeting.title).toBe('11월 제직회')
    expect(meeting.place).toBe('본당')
    expect(meeting.scribe).toBe('고경석')
    await state().settled()
  })
})

describe('addEntry', () => {
  test('줄을 더하면 바로 저장된다 — 회의 중에 앱이 죽어도 남아야 한다', async () => {
    const meeting = state().createMeeting()

    const entry = state().addEntry({ meetingId: meeting.id, kind: 'decision', text: '예산 50만원' })
    await state().settled()

    expect(entry).not.toBeNull()
    expect((await db.entries.get(entry!.id))?.text).toBe('예산 50만원')
  })

  test('빈 글은 줄을 만들지 않는다 — 회의 중에 두 번 누르는 일이 잦다', () => {
    const meeting = state().createMeeting()

    expect(state().addEntry({ meetingId: meeting.id, kind: 'memo', text: '   ' })).toBeNull()
    expect(Object.keys(state().entities.entries)).toHaveLength(0)
  })

  test('줄 순서가 넣은 순서대로 붙는다', () => {
    const meeting = state().createMeeting()

    const first = state().addEntry({ meetingId: meeting.id, kind: 'speech', text: '첫째' })
    const second = state().addEntry({ meetingId: meeting.id, kind: 'speech', text: '둘째' })

    expect(first!.order).toBe(0)
    expect(second!.order).toBe(1)
  })

  test('같은 밀리초에 두 줄을 넣어도 순서가 다르다', () => {
    const meeting = state().createMeeting()

    const first = state().addEntry({ meetingId: meeting.id, kind: 'speech', text: '첫째' })
    const second = state().addEntry({ meetingId: meeting.id, kind: 'speech', text: '둘째' })

    expect(first!.at).toBe(second!.at)
    expect(first!.order).not.toBe(second!.order)
  })

  test('회의마다 순서를 따로 센다', () => {
    const one = state().createMeeting()
    const two = state().createMeeting()
    state().addEntry({ meetingId: one.id, kind: 'memo', text: 'a' })

    const entry = state().addEntry({ meetingId: two.id, kind: 'memo', text: 'b' })

    expect(entry!.order).toBe(0)
  })
})

describe('updateEntry / removeEntry', () => {
  test('줄의 종류를 바꿀 수 있다 — 발언이라 적었는데 결정이었던 경우', async () => {
    const meeting = state().createMeeting()
    const entry = state().addEntry({ meetingId: meeting.id, kind: 'speech', text: '그렇게 하죠' })!

    state().updateEntry(entry.id, { kind: 'decision', result: 'unanimous' })
    await state().settled()

    expect((await db.entries.get(entry.id))?.kind).toBe('decision')
    expect(state().entities.entries[entry.id].result).toBe('unanimous')
  })

  test('없는 줄을 고치라고 하면 조용히 넘긴다', () => {
    state().updateEntry('없음', { text: '바꿈' })

    expect(Object.keys(state().entities.entries)).toHaveLength(0)
  })

  test('줄을 지우면 DB 에서도 사라진다', async () => {
    const meeting = state().createMeeting()
    const entry = state().addEntry({ meetingId: meeting.id, kind: 'memo', text: '지울 것' })!

    state().removeEntry(entry.id)
    await state().settled()

    expect(await db.entries.get(entry.id)).toBeUndefined()
  })
})

describe('안건', () => {
  test('안건을 더하면 순서가 붙는다', () => {
    const meeting = state().createMeeting()

    const first = state().addAgenda(meeting.id, '첫 안건')
    const second = state().addAgenda(meeting.id, '둘째 안건')

    expect(first!.order).toBe(0)
    expect(second!.order).toBe(1)
  })

  test('빈 제목의 안건은 만들지 않는다', () => {
    const meeting = state().createMeeting()

    expect(state().addAgenda(meeting.id, '  ')).toBeNull()
  })

  test('안건을 지워도 그 줄은 남는다 — 적은 것이 사라지면 안 된다', async () => {
    const meeting = state().createMeeting()
    const agenda = state().addAgenda(meeting.id, '지울 안건')!
    const entry = state().addEntry({ meetingId: meeting.id, kind: 'speech', text: '남아야 한다', agendaId: agenda.id })!

    state().removeAgenda(agenda.id)
    await state().settled()

    expect(state().entities.agendas[agenda.id]).toBeUndefined()
    expect((await db.entries.get(entry.id))?.text).toBe('남아야 한다')
  })

  test('안건 순서를 옮기면 전체 번호가 다시 매겨진다', async () => {
    const meeting = state().createMeeting()
    const a = state().addAgenda(meeting.id, 'A')!
    state().addAgenda(meeting.id, 'B')
    const c = state().addAgenda(meeting.id, 'C')!

    state().moveAgenda(meeting.id, c.id, 0)
    await state().settled()

    expect(state().entities.agendas[c.id].order).toBe(0)
    expect(state().entities.agendas[a.id].order).toBe(1)
  })
})

describe('개회·폐회·녹음 기준', () => {
  test('개회를 누르면 시각이 남는다', () => {
    const meeting = state().createMeeting()

    state().openMeeting(meeting.id)

    expect(state().entities.meetings[meeting.id].openedAt).toBe(new Date(NOW).toISOString())
  })

  test('개회를 두 번 눌러도 시각이 밀리지 않는다', () => {
    const meeting = state().createMeeting()
    state().openMeeting(meeting.id)
    clock = NOW + 60_000

    state().openMeeting(meeting.id)

    expect(state().entities.meetings[meeting.id].openedAt).toBe(new Date(NOW).toISOString())
  })

  test('폐회는 다시 누르면 갱신된다 — 잘못 눌렀을 때 고칠 수 있어야 한다', () => {
    const meeting = state().createMeeting()
    state().closeMeeting(meeting.id)
    clock = NOW + 60_000

    state().closeMeeting(meeting.id)

    expect(state().entities.meetings[meeting.id].closedAt).toBe(new Date(NOW + 60_000).toISOString())
  })

  test('녹음 기준 시각을 기록하고 지울 수 있다', () => {
    const meeting = state().createMeeting()

    state().markRecordingStart(meeting.id)
    expect(state().entities.meetings[meeting.id].recordingStartedAt).toBe(new Date(NOW).toISOString())

    state().clearRecordingStart(meeting.id)
    expect(state().entities.meetings[meeting.id].recordingStartedAt).toBeNull()
  })
})

describe('사람과 참석', () => {
  test('사람을 명부에 더한다', async () => {
    const person = state().addPerson('김영수', '장로')
    await state().settled()

    expect((await db.people.get(person!.id))?.role).toBe('장로')
  })

  test('빈 이름은 더하지 않는다', () => {
    expect(state().addPerson('  ')).toBeNull()
  })

  test('사람을 숨겨도 지우지 않는다 — 지난 회의록의 발언자가 사라지면 안 된다', async () => {
    const person = state().addPerson('김영수')!

    state().hidePerson(person.id, true)
    await state().settled()

    expect((await db.people.get(person.id))?.hidden).toBe(true)
  })

  test('참석 상태를 바꾼다', () => {
    const meeting = state().createMeeting()
    const person = state().addPerson('김영수')!

    state().setAttendance(meeting.id, person.id, 'late')

    expect(state().entities.meetings[meeting.id].attendees).toEqual([
      { personId: person.id, attendance: 'late' },
    ])
  })

  test('참석자를 뺀다', () => {
    const meeting = state().createMeeting()
    const person = state().addPerson('김영수')!
    state().setAttendance(meeting.id, person.id, 'present')

    state().removeAttendee(meeting.id, person.id)

    expect(state().entities.meetings[meeting.id].attendees).toEqual([])
  })
})

describe('removeMeeting', () => {
  test('회의를 지우면 그 안건과 줄도 함께 사라진다', async () => {
    const meeting = state().createMeeting()
    const agenda = state().addAgenda(meeting.id, '안건')!
    const entry = state().addEntry({ meetingId: meeting.id, kind: 'memo', text: '줄' })!
    await state().settled()

    state().removeMeeting(meeting.id)
    await state().settled()

    expect(state().entities.meetings[meeting.id]).toBeUndefined()
    expect(state().entities.agendas[agenda.id]).toBeUndefined()
    expect(await db.entries.get(entry.id)).toBeUndefined()
  })

  test('다른 회의는 남는다', async () => {
    const one = state().createMeeting()
    const two = state().createMeeting()
    const keep = state().addEntry({ meetingId: two.id, kind: 'memo', text: '남을 줄' })!
    await state().settled()

    state().removeMeeting(one.id)
    await state().settled()

    expect(state().entities.meetings[two.id]).toBeDefined()
    expect(await db.entries.get(keep.id)).toBeDefined()
  })
})

describe('reload', () => {
  test('DB 에 있는 것을 다시 읽어 온다', async () => {
    const meeting = state().createMeeting()
    state().addEntry({ meetingId: meeting.id, kind: 'decision', text: '정했다' })
    await state().settled()

    await state().reload()

    expect(Object.values(state().entities.entries)).toHaveLength(1)
  })
})

describe('clearEverything', () => {
  test('모두 지운다', async () => {
    const meeting = state().createMeeting()
    state().addEntry({ meetingId: meeting.id, kind: 'memo', text: '지울 것' })
    await state().settled()

    await state().clearEverything()

    expect(Object.keys(state().entities.meetings)).toEqual([])
    expect(await db.entries.count()).toBe(0)
  })
})
