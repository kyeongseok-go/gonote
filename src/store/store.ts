import { create } from 'zustand'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { GonoteDB } from '../db/db'
import { clearAll, deleteMeetingDeep, loadAll, persistChanges, persistSettings } from '../db/persist'
import { nextAgendaOrder, nextOrder } from '../domain/minutes'
import { isoOf } from '../domain/time'
import type { Agenda, Attendance, Entry, EntryKind, Meeting, Person, Settings } from '../domain/types'
import { applyChangeSet, emptyEntityState, isEmptyChangeSet } from './changes'
import type { ChangeSet, EntityState } from './changes'
import { newAgenda, newEntry, newMeeting, newPerson, reordered, withAttendance, withoutAttendee } from './commands/build'
import { defaultSettings, mergeSettings } from './defaults'
import { newId } from './id'

/** 저장 실패 시 총 시도 횟수와 사이에 쉬는 시간 */
const WRITE_ATTEMPTS = 3
const WRITE_RETRY_MS = 200

export interface AppState {
  ready: boolean
  entities: EntityState
  settings: Settings
  /** 저장에 실패하면 문구가 채워진다. 사용자가 닫을 때까지 남는다. */
  persistError: string | null
  /** 처음 읽기에 실패했을 때의 문구. 화면 전체를 오류 안내로 바꾼다. */
  loadError: string | null
  /** 아직 IndexedDB 에 쓰는 중인 변경 수. 0 이 아니면 탭을 닫으면 안 된다. */
  pendingWrites: number

  load: () => Promise<void>
  reload: () => Promise<void>
  /** 진행 중인 쓰기가 끝날 때까지 기다린다. 테스트와 '지금 저장됐나' 표시가 쓴다. */
  settled: () => Promise<void>
  /** 모든 쓰기가 지나가는 한 경로. 메모리와 IndexedDB 가 함께 움직인다. */
  commit: (cs: ChangeSet) => void
  updateSettings: (patch: Partial<Settings>) => void
  dismissError: () => void

  createMeeting: (title?: string) => Meeting
  updateMeeting: (id: string, patch: Partial<Meeting>) => void
  /** 회의와 그 안건·줄·녹음을 통째로 지운다. */
  removeMeeting: (id: string) => void
  /** 개회를 누른다. 이미 눌렀으면 그대로 둔다 — 두 번 눌러 시각이 밀리지 않게. */
  openMeeting: (id: string) => void
  closeMeeting: (id: string) => void
  /** 폰 음성 메모를 켠 시각을 기록한다. 이후 모든 줄에 경과 시간이 붙는다. */
  markRecordingStart: (id: string) => void
  clearRecordingStart: (id: string) => void

  /** 회의록의 한 줄을 더한다. **이 앱에서 가장 많이 불리는 동작이다.** */
  addEntry: (input: { meetingId: string; kind: EntryKind; text: string; agendaId?: string | null; speakerId?: string | null }) => Entry | null
  updateEntry: (id: string, patch: Partial<Entry>) => void
  removeEntry: (id: string) => void

  addAgenda: (meetingId: string, title: string) => Agenda | null
  updateAgenda: (id: string, patch: Partial<Agenda>) => void
  /** 안건만 지운다. **그 안건의 줄은 지우지 않는다** — 적은 것이 사라지면 안 된다. */
  removeAgenda: (id: string) => void
  moveAgenda: (meetingId: string, agendaId: string, toIndex: number) => void

  addPerson: (name: string, role?: string) => Person | null
  updatePerson: (id: string, patch: Partial<Person>) => void
  /** 명부에서 숨긴다. 지우지 않는다 — 지난 회의록의 발언자가 사라지면 안 된다. */
  hidePerson: (id: string, hidden: boolean) => void
  setAttendance: (meetingId: string, personId: string, attendance: Attendance) => void
  removeAttendee: (meetingId: string, personId: string) => void

  /** 모두 지우기. 되돌릴 수 없다. */
  clearEverything: () => Promise<void>
}

export type AppStore = UseBoundStore<StoreApi<AppState>>

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : '알 수 없는 오류'
}

/**
 * 저장을 몇 번 더 시도한다. 한 번 실패한 쓰기는 다시 쓰지 않으므로 메모리와 DB 가 영구히 어긋난다.
 * IndexedDB 는 일시적인 잠금으로 실패할 수 있어, 짧게 쉬고 다시 해 보면 대개 성공한다.
 */
async function withRetry(work: () => Promise<void>, attempts = WRITE_ATTEMPTS): Promise<void> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await work()
      return
    } catch (error: unknown) {
      if (attempt >= attempts) throw error
      await new Promise((resolve) => setTimeout(resolve, WRITE_RETRY_MS * attempt))
    }
  }
}

export function createAppStore(db: GonoteDB, now: () => number = Date.now): AppStore {
  return create<AppState>((set, get) => {
    /** 진행 중인 쓰기. settled() 가 이걸 기다린다. */
    const inFlight = new Set<Promise<void>>()

    /** 모든 쓰기가 이 래퍼를 지난다: 진행 수를 세고, 실패는 사용자가 닫을 때까지 남긴다. */
    const track = (work: () => Promise<void>, failure: (error: unknown) => string): void => {
      set((s) => ({ pendingWrites: s.pendingWrites + 1 }))
      const running = withRetry(work)
        .catch((error: unknown) => {
          set((s) => ({ persistError: s.persistError ?? failure(error) }))
        })
        .finally(() => {
          inFlight.delete(running)
          set((s) => ({ pendingWrites: Math.max(0, s.pendingWrites - 1) }))
        })
      inFlight.add(running)
    }

    const commit = (cs: ChangeSet): void => {
      if (isEmptyChangeSet(cs)) return
      set({ entities: applyChangeSet(get().entities, cs) })
      // 먼저 난 오류를 덮어쓰지 않는다. 처음 원인이 가장 중요하다.
      track(
        () => persistChanges(db, cs),
        (error) =>
          `저장하지 못했어요. 이 탭을 닫으면 방금 적은 것이 사라질 수 있어요. (${describeError(error)})`,
      )
    }

    /** 한 행만 고치는 흔한 경우. 없는 행을 고치라고 하면 조용히 넘긴다. */
    const patchRow = <K extends 'meetings' | 'agendas' | 'entries' | 'people'>(
      table: K,
      id: string,
      patch: Partial<EntityState[K][string]>,
    ): void => {
      const before = get().entities[table][id]
      if (!before) return
      commit({ puts: { [table]: [{ ...before, ...patch }] } as never, deletes: {} })
    }

    const initialize = async (): Promise<void> => {
      const loaded = await loadAll(db)
      const settings = mergeSettings(loaded.settings)
      if (!loaded.settings) await persistSettings(db, settings)
      set({ entities: loaded.entities, settings, ready: true, loadError: null })
    }

    // load() 가 여러 번 불려도(React StrictMode) 실제 읽기는 한 번만 한다.
    let initializing: Promise<void> | null = null
    const start = (): Promise<void> => {
      const run = initialize().catch((error: unknown) => {
        initializing = null
        set({ loadError: `저장된 회의록을 읽지 못했어요. (${describeError(error)})` })
        throw error
      })
      initializing = run
      return run
    }

    return {
      ready: false,
      entities: emptyEntityState(),
      settings: defaultSettings(),
      persistError: null,
      loadError: null,
      pendingWrites: 0,

      load: () => initializing ?? start(),
      reload: () => start(),
      settled: async () => {
        while (inFlight.size > 0) await Promise.allSettled([...inFlight])
      },
      commit,
      dismissError: () => set({ persistError: null }),

      updateSettings: (patch) => {
        const settings = { ...get().settings, ...patch }
        set({ settings })
        track(
          () => persistSettings(db, settings),
          (error) => `설정을 저장하지 못했어요. (${describeError(error)})`,
        )
      },

      createMeeting: (title) => {
        const meeting = newMeeting({ id: newId(), now: now(), settings: get().settings, title })
        commit({ puts: { meetings: [meeting] }, deletes: {} })
        return meeting
      },

      updateMeeting: (id, patch) => patchRow('meetings', id, patch),

      removeMeeting: (id) => {
        const entities = get().entities
        const agendaIds = Object.values(entities.agendas)
          .filter((row) => row.meetingId === id)
          .map((row) => row.id)
        const entryIds = Object.values(entities.entries)
          .filter((row) => row.meetingId === id)
          .map((row) => row.id)
        // 메모리에서 먼저 지우고, DB 는 녹음까지 함께 지우는 전용 경로로 보낸다.
        set({
          entities: applyChangeSet(entities, {
            puts: {},
            deletes: { meetings: [id], agendas: agendaIds, entries: entryIds },
          }),
        })
        track(
          () => deleteMeetingDeep(db, id),
          (error) => `회의를 지우지 못했어요. (${describeError(error)})`,
        )
      },

      openMeeting: (id) => {
        const meeting = get().entities.meetings[id]
        if (!meeting || meeting.openedAt) return
        patchRow('meetings', id, { openedAt: isoOf(now()) })
      },

      closeMeeting: (id) => patchRow('meetings', id, { closedAt: isoOf(now()) }),
      markRecordingStart: (id) => patchRow('meetings', id, { recordingStartedAt: isoOf(now()) }),
      clearRecordingStart: (id) => patchRow('meetings', id, { recordingStartedAt: null }),

      addEntry: ({ meetingId, kind, text, agendaId, speakerId }) => {
        // 빈 줄은 만들지 않는다. 회의 중에 실수로 두 번 누르는 일이 잦다.
        if (text.trim().length === 0) return null
        const entry = newEntry({
          id: newId(),
          now: now(),
          meetingId,
          kind,
          text,
          order: nextOrder(get().entities.entries, meetingId),
          agendaId: agendaId ?? null,
          speakerId: speakerId ?? null,
        })
        commit({ puts: { entries: [entry] }, deletes: {} })
        return entry
      },

      updateEntry: (id, patch) => patchRow('entries', id, patch),
      removeEntry: (id) => commit({ puts: {}, deletes: { entries: [id] } }),

      addAgenda: (meetingId, title) => {
        if (title.trim().length === 0) return null
        const agenda = newAgenda({
          id: newId(),
          meetingId,
          title,
          order: nextAgendaOrder(get().entities.agendas, meetingId),
        })
        commit({ puts: { agendas: [agenda] }, deletes: {} })
        return agenda
      },

      updateAgenda: (id, patch) => patchRow('agendas', id, patch),

      // 안건만 지운다. 그 안건의 줄은 '안건 밖' 으로 떨어져 회의록에 남는다(buildMinutes 가 받는다).
      removeAgenda: (id) => commit({ puts: {}, deletes: { agendas: [id] } }),

      moveAgenda: (meetingId, agendaId, toIndex) => {
        const mine = Object.values(get().entities.agendas).filter((row) => row.meetingId === meetingId)
        const next = reordered(mine, agendaId, toIndex)
        commit({ puts: { agendas: next }, deletes: {} })
      },

      addPerson: (name, role) => {
        if (name.trim().length === 0) return null
        const person = newPerson({ id: newId(), name, role })
        commit({ puts: { people: [person] }, deletes: {} })
        return person
      },

      updatePerson: (id, patch) => patchRow('people', id, patch),
      hidePerson: (id, hidden) => patchRow('people', id, { hidden }),

      setAttendance: (meetingId, personId, attendance) => {
        const meeting = get().entities.meetings[meetingId]
        if (!meeting) return
        commit({ puts: { meetings: [withAttendance(meeting, personId, attendance)] }, deletes: {} })
      },

      removeAttendee: (meetingId, personId) => {
        const meeting = get().entities.meetings[meetingId]
        if (!meeting) return
        commit({ puts: { meetings: [withoutAttendee(meeting, personId)] }, deletes: {} })
      },

      clearEverything: async () => {
        await clearAll(db)
        set({ entities: emptyEntityState() })
      },
    }
  })
}
