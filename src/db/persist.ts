import { emptyEntityState, keyOf, TABLE_NAMES } from '../store/changes'
import type { ChangeSet, EntityState, TableMap, TableName } from '../store/changes'
import type { Clip, Settings } from '../domain/types'
import type { GonoteDB } from './db'

export interface LoadedData {
  entities: EntityState
  settings: Settings | null
}

export async function loadAll(db: GonoteDB): Promise<LoadedData> {
  const entities = emptyEntityState() as { [K in TableName]: Record<string, TableMap[K]> }
  // 모든 테이블을 한 읽기 트랜잭션으로 읽는다. 따로 읽으면 읽는 도중 들어온 쓰기 때문에
  // 테이블끼리 시점이 어긋난 스냅샷(줄은 있는데 그 회의가 없음)이 만들어질 수 있다.
  const settings = await db.transaction('r', [...TABLE_NAMES.map((t) => db.table(t)), db.settings], async () => {
    await Promise.all(
      TABLE_NAMES.map(async (name) => {
        const rows = (await db.table(name).toArray()) as TableMap[typeof name][]
        const table: Record<string, TableMap[typeof name]> = {}
        for (const row of rows) table[keyOf(name, row)] = row
        ;(entities as Record<string, unknown>)[name] = table
      }),
    )
    return (await db.settings.get('settings')) ?? null
  })
  return { entities, settings }
}

/** 변경 집합을 한 트랜잭션으로 기록한다. 일부만 저장된 상태를 만들지 않으려는 것이다. */
export async function persistChanges(db: GonoteDB, cs: ChangeSet): Promise<void> {
  const tables = TABLE_NAMES.filter((t) => (cs.puts[t]?.length ?? 0) > 0 || (cs.deletes[t]?.length ?? 0) > 0)
  if (tables.length === 0) return
  await db.transaction(
    'rw',
    tables.map((t) => db.table(t)),
    async () => {
      for (const t of tables) {
        const table = db.table(t)
        const dels = cs.deletes[t]
        if (dels?.length) await table.bulkDelete([...dels])
        const puts = cs.puts[t]
        if (puts?.length) await table.bulkPut([...puts])
      }
    },
  )
}

export async function persistSettings(db: GonoteDB, settings: Settings): Promise<void> {
  await db.settings.put(settings)
}

/** 녹음을 저장한다. Blob 이라 변경 집합을 타지 않고 이 경로로만 들어온다. */
export async function saveClip(db: GonoteDB, clip: Clip): Promise<void> {
  await db.clips.put(clip)
}

export async function clipsOfMeeting(db: GonoteDB, meetingId: string): Promise<Clip[]> {
  const rows = await db.clips.where('meetingId').equals(meetingId).toArray()
  return rows.sort((a, b) => a.createdAt - b.createdAt)
}

export async function deleteClip(db: GonoteDB, id: string): Promise<void> {
  await db.clips.delete(id)
}

/**
 * 회의 하나를 통째로 지운다. 그 회의의 안건·줄·녹음까지 함께 지운다 —
 * 남겨 두면 어디에도 안 보이면서 용량만 먹는 고아 행이 된다.
 */
export async function deleteMeetingDeep(db: GonoteDB, meetingId: string): Promise<void> {
  await db.transaction('rw', [db.meetings, db.agendas, db.entries, db.clips], async () => {
    await db.meetings.delete(meetingId)
    await db.agendas.where('meetingId').equals(meetingId).delete()
    await db.entries.where('meetingId').equals(meetingId).delete()
    await db.clips.where('meetingId').equals(meetingId).delete()
  })
}

/** 전체 삭제(설정의 '모두 지우기'). 명부와 설정까지 지운다. */
export async function clearAll(db: GonoteDB): Promise<void> {
  await db.transaction('rw', [db.meetings, db.people, db.agendas, db.entries, db.clips], async () => {
    await Promise.all([
      db.meetings.clear(),
      db.people.clear(),
      db.agendas.clear(),
      db.entries.clear(),
      db.clips.clear(),
    ])
  })
}
