import { describe, expect, test } from 'vitest'
import { BACKUP_VERSION, backupFileName, buildBackup, readBackup } from './backup'
import { emptyEntityState } from '../../store/changes'
import { defaultSettings } from '../../store/defaults'
import { makeAgenda, makeEntry, makeMeeting, makePerson } from '../../test/factories'

const NOW = '2026-11-01T02:30:00.000Z'

function fullState() {
  return {
    ...emptyEntityState(),
    meetings: { m1: makeMeeting() },
    people: { p1: makePerson() },
    agendas: { a1: makeAgenda() },
    entries: { e1: makeEntry({ kind: 'decision', text: '정했다' }) },
  }
}

describe('buildBackup', () => {
  test('네 테이블과 설정을 담는다', () => {
    const backup = buildBackup(fullState(), defaultSettings(), NOW)

    expect(backup.app).toBe('gonote')
    expect(backup.version).toBe(BACKUP_VERSION)
    expect(Object.keys(backup.meetings)).toEqual(['m1'])
    expect(backup.entries.e1.text).toBe('정했다')
    expect(backup.settings?.theme).toBe('auto')
  })

  test('내보낸 시각이 들어간다', () => {
    expect(buildBackup(emptyEntityState(), defaultSettings(), NOW).exportedAt).toBe(NOW)
  })
})

describe('readBackup', () => {
  test('내보낸 것을 그대로 다시 읽는다', () => {
    const backup = buildBackup(fullState(), defaultSettings(), NOW)

    const read = readBackup(JSON.parse(JSON.stringify(backup)))

    expect(read.backup).not.toBeNull()
    expect(read.backup?.entries.e1.text).toBe('정했다')
  })

  test('무엇이 들어오는지 세어서 알려 준다 — 덮어쓰기 전에 사람이 판단해야 한다', () => {
    const backup = buildBackup(fullState(), defaultSettings(), NOW)

    const read = readBackup(JSON.parse(JSON.stringify(backup)))

    expect(read.message).toContain('회의 1개')
    expect(read.message).toContain('기록 1줄')
    expect(read.message).toContain('명부 1명')
  })

  test('다른 앱의 백업은 거절한다', () => {
    const read = readBackup({ app: 'godo', version: 1, exportedAt: NOW, meetings: {}, people: {}, agendas: {}, entries: {} })

    expect(read.backup).toBeNull()
    expect(read.message).toContain('gonote 백업 파일이 아니에요')
  })

  test('앞으로 나온 버전은 거절한다 — 조용히 깨뜨리지 않는다', () => {
    const backup = { ...buildBackup(fullState(), defaultSettings(), NOW), version: BACKUP_VERSION + 1 }

    const read = readBackup(JSON.parse(JSON.stringify(backup)))

    expect(read.backup).toBeNull()
    expect(read.message).toContain('더 새로운 버전')
  })

  test('모양이 틀린 파일은 거절한다', () => {
    const read = readBackup({ app: 'gonote', version: 1, exportedAt: NOW, meetings: { m1: { id: 'm1' } }, people: {}, agendas: {}, entries: {} })

    expect(read.backup).toBeNull()
    expect(read.message).toContain('파일 모양이 맞지 않아요')
  })

  test('JSON 이 아예 아니면 거절한다', () => {
    expect(readBackup('그냥 글').backup).toBeNull()
    expect(readBackup(null).backup).toBeNull()
  })

  test('설정이 없는 백업도 읽는다 — 회의록이 본체다', () => {
    const backup = buildBackup(fullState(), defaultSettings(), NOW)
    const { settings: _settings, ...withoutSettings } = JSON.parse(JSON.stringify(backup))

    expect(readBackup(withoutSettings).backup).not.toBeNull()
  })
})

describe('backupFileName', () => {
  test('날짜가 들어간다 — 여러 개를 모아 둘 수 있게', () => {
    expect(backupFileName(NOW)).toBe('gonote-백업-2026-11-01.json')
  })
})
