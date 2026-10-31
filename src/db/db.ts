import Dexie, { type EntityTable } from 'dexie'
import type { Agenda, Clip, Entry, Meeting, Person, Settings } from '../domain/types'

/** 다른 탭이 DB 버전을 올려서 이 탭의 연결이 닫혔을 때 알리는 이벤트 */
export const DB_STALE_EVENT = 'gonote:db-stale'

export class GonoteDB extends Dexie {
  meetings!: EntityTable<Meeting, 'id'>
  people!: EntityTable<Person, 'id'>
  agendas!: EntityTable<Agenda, 'id'>
  entries!: EntityTable<Entry, 'id'>
  clips!: EntityTable<Clip, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor(name = 'gonote') {
    super(name)
    // 다른 탭이 새 버전으로 올라가려 하면 연결을 닫아 주고 이 탭에는 새로고침을 안내한다.
    // 그냥 두면 업그레이드가 막히고 오래된 탭이 낡은 데이터를 계속 쓴다.
    this.on('versionchange', () => {
      this.close()
      if (typeof window !== 'undefined') window.dispatchEvent(new Event(DB_STALE_EVENT))
    })
    // 인덱스는 실제로 조회에 쓰는 것만 둔다. 스키마를 바꿀 때는 version 을 올리고 upgrade 를 붙인다.
    this.version(1).stores({
      meetings: 'id, date, kind',
      people: 'id, hidden',
      agendas: 'id, meetingId, order',
      entries: 'id, meetingId, agendaId, kind, order',
      clips: 'id, meetingId, entryId, createdAt',
      settings: 'id',
    })
  }
}
