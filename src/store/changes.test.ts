import { describe, expect, test } from 'vitest'
import {
  applyChangeSet,
  emptyChangeSet,
  emptyEntityState,
  isEmptyChangeSet,
  mergeChangeSets,
} from './changes'
import type { Entry, Meeting } from '../domain/types'
import { makeEntry, makeMeeting } from '../test/factories'

function meeting(id: string, title = '11월 제직회'): Meeting {
  return makeMeeting({ id, title })
}

function entry(id: string, text = '첫 줄'): Entry {
  return makeEntry({ id, text })
}

describe('applyChangeSet', () => {
  test('넣은 것이 키로 들어간다', () => {
    const next = applyChangeSet(emptyEntityState(), { puts: { meetings: [meeting('m1')] }, deletes: {} })

    expect(next.meetings.m1.title).toBe('11월 제직회')
  })

  test('원본을 바꾸지 않는다', () => {
    const before = emptyEntityState()

    applyChangeSet(before, { puts: { meetings: [meeting('m1')] }, deletes: {} })

    expect(before.meetings).toEqual({})
  })

  test('건드리지 않은 테이블은 같은 객체를 그대로 쓴다 — 쓸데없이 다시 그리지 않게', () => {
    const before = applyChangeSet(emptyEntityState(), { puts: { entries: [entry('e1')] }, deletes: {} })

    const next = applyChangeSet(before, { puts: { meetings: [meeting('m1')] }, deletes: {} })

    expect(next.entries).toBe(before.entries)
  })

  test('지운 것이 사라진다', () => {
    const before = applyChangeSet(emptyEntityState(), { puts: { entries: [entry('e1')] }, deletes: {} })

    const next = applyChangeSet(before, { puts: {}, deletes: { entries: ['e1'] } })

    expect(next.entries).toEqual({})
  })

  test('같은 키를 다시 넣으면 덮어쓴다', () => {
    const before = applyChangeSet(emptyEntityState(), { puts: { entries: [entry('e1', '첫 줄')] }, deletes: {} })

    const next = applyChangeSet(before, { puts: { entries: [entry('e1', '고친 줄')] }, deletes: {} })

    expect(next.entries.e1.text).toBe('고친 줄')
  })
})

describe('mergeChangeSets', () => {
  test('나중 것이 이긴다', () => {
    const merged = mergeChangeSets(
      { puts: { entries: [entry('e1', '먼저')] }, deletes: {} },
      { puts: { entries: [entry('e1', '나중')] }, deletes: {} },
    )

    expect(merged.puts.entries).toHaveLength(1)
    expect(merged.puts.entries?.[0].text).toBe('나중')
  })

  test('뒤에서 지우면 앞의 넣기가 취소된다', () => {
    const merged = mergeChangeSets(
      { puts: { entries: [entry('e1')] }, deletes: {} },
      { puts: {}, deletes: { entries: ['e1'] } },
    )

    expect(merged.puts.entries).toBeUndefined()
    expect(merged.deletes.entries).toEqual(['e1'])
  })

  test('지운 뒤에 다시 넣으면 넣기가 이긴다', () => {
    const merged = mergeChangeSets(
      { puts: {}, deletes: { entries: ['e1'] } },
      { puts: { entries: [entry('e1')] }, deletes: {} },
    )

    expect(merged.puts.entries).toHaveLength(1)
    expect(merged.deletes.entries).toBeUndefined()
  })

  test('여러 테이블을 한 변경으로 묶는다', () => {
    const merged = mergeChangeSets(
      { puts: { meetings: [meeting('m1')] }, deletes: {} },
      { puts: { entries: [entry('e1')] }, deletes: {} },
    )

    expect(merged.puts.meetings).toHaveLength(1)
    expect(merged.puts.entries).toHaveLength(1)
  })
})

describe('isEmptyChangeSet', () => {
  test('빈 변경을 알아본다', () => {
    expect(isEmptyChangeSet(emptyChangeSet())).toBe(true)
    expect(isEmptyChangeSet({ puts: { entries: [] }, deletes: { entries: [] } })).toBe(true)
  })

  test('하나라도 있으면 비지 않았다', () => {
    expect(isEmptyChangeSet({ puts: { entries: [entry('e1')] }, deletes: {} })).toBe(false)
    expect(isEmptyChangeSet({ puts: {}, deletes: { entries: ['e1'] } })).toBe(false)
  })
})
