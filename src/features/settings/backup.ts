// 내보내기·가져오기. **이 앱의 자료는 이 폰 안에만 있다** — 폰을 바꾸면 사라진다.
// 그 구멍을 메우는 유일한 길이다.
//
// 녹음(Clip)은 넣지 않는다. Blob 이라 파일이 수십 MB 가 되고, 회의록의 본체가 아니다.
import { z } from 'zod'
import type { EntityState } from '../../store/changes'
import type { Settings } from '../../domain/types'

/** 파일 모양이 바뀌면 올린다. 앞으로 나온 버전은 **읽지 않는다** — 조용히 깨뜨리지 않으려는 것이다. */
export const BACKUP_VERSION = 1
const APP = 'gonote'

const attendeeSchema = z.object({
  personId: z.string(),
  attendance: z.enum(['present', 'absent', 'late']),
})

const meetingSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  kind: z.string(),
  date: z.string(),
  place: z.string(),
  scribe: z.string(),
  attendees: z.array(attendeeSchema),
  openedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  recordingStartedAt: z.string().nullable(),
  nextMeetingNote: z.string(),
  createdAt: z.string(),
})

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  role: z.string(),
  hidden: z.boolean(),
})

const agendaSchema = z.object({
  id: z.string().min(1),
  meetingId: z.string(),
  title: z.string(),
  order: z.number(),
  result: z.enum(['passed', 'rejected', 'tabled', 'unanimous']).nullable(),
})

const entrySchema = z.object({
  id: z.string().min(1),
  meetingId: z.string(),
  agendaId: z.string().nullable(),
  kind: z.enum(['speech', 'decision', 'action', 'report', 'memo']),
  speakerId: z.string().nullable(),
  text: z.string(),
  at: z.string(),
  order: z.number(),
  assigneeId: z.string().nullable(),
  assigneeText: z.string(),
  due: z.string().nullable(),
  done: z.boolean(),
  moverId: z.string().nullable(),
  seconderId: z.string().nullable(),
  vote: z.object({
    for: z.number().nullable(),
    against: z.number().nullable(),
    abstain: z.number().nullable(),
  }),
  result: z.enum(['passed', 'rejected', 'tabled', 'unanimous']).nullable(),
})

const settingsSchema = z.object({
  id: z.literal('settings'),
  theme: z.enum(['auto', 'light', 'dark']),
  defaultKind: z.string(),
  defaultPlace: z.string(),
  defaultScribe: z.string(),
  shareIncludesSpeech: z.boolean(),
  shareHidesNames: z.boolean(),
})

const backupSchema = z.object({
  app: z.literal(APP),
  version: z.number().int().positive(),
  exportedAt: z.string(),
  meetings: z.record(z.string(), meetingSchema),
  people: z.record(z.string(), personSchema),
  agendas: z.record(z.string(), agendaSchema),
  entries: z.record(z.string(), entrySchema),
  settings: settingsSchema.optional(),
})

export type Backup = z.infer<typeof backupSchema>

export function buildBackup(entities: EntityState, settings: Settings, exportedAt: string): Backup {
  return {
    app: APP,
    version: BACKUP_VERSION,
    exportedAt,
    meetings: entities.meetings as Backup['meetings'],
    people: entities.people as Backup['people'],
    agendas: entities.agendas as Backup['agendas'],
    entries: entities.entries as Backup['entries'],
    settings,
  }
}

export interface ReadResult {
  backup: Backup | null
  /** 사람에게 보여 줄 말. 성공이면 무엇이 들어오는지, 실패면 왜 안 되는지 */
  message: string
}

/**
 * 가져올 파일을 읽는다. **남의 앱 백업과 앞으로 나온 버전은 거절한다.**
 * 틀린 파일을 받아 회의록을 덮어쓰는 쪽이 못 가져오는 쪽보다 훨씬 나쁘다.
 */
export function readBackup(raw: unknown): ReadResult {
  const parsed = backupSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    if (first?.path.join('.') === 'app') return { backup: null, message: 'gonote 백업 파일이 아니에요.' }
    return { backup: null, message: `파일 모양이 맞지 않아요. (${first?.message ?? '알 수 없음'})` }
  }
  if (parsed.data.version > BACKUP_VERSION) {
    return {
      backup: null,
      message: '더 새로운 버전에서 만든 백업이에요. 앱을 새로 고친 뒤에 다시 해 주세요.',
    }
  }
  const counts = {
    meetings: Object.keys(parsed.data.meetings).length,
    entries: Object.keys(parsed.data.entries).length,
    people: Object.keys(parsed.data.people).length,
  }
  return {
    backup: parsed.data,
    message: `회의 ${counts.meetings}개 · 기록 ${counts.entries}줄 · 명부 ${counts.people}명을 가져올 수 있어요.`,
  }
}

/** 내보낼 파일 이름. 날짜가 들어가야 여러 개를 모아 둘 수 있다. */
export function backupFileName(exportedAt: string): string {
  const day = exportedAt.slice(0, 10)
  return `gonote-백업-${day}.json`
}
