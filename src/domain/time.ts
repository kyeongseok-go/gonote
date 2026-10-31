// 시각과 날짜를 다루는 순수 함수들.
//
// **어느 함수도 Date.now() 를 부르지 않는다.** 지금·오늘은 늘 인자로 받는다.
// 그래서 테스트에서 시간을 모킹할 필요가 없고, 자정 넘김·월말·연말을 직접 넣어 볼 수 있다.
import type { DayKey } from './types'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const
const DAY_KEY_SHAPE = /^\d{4}-\d{2}-\d{2}$/

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** 밀리초 → 'YYYY-MM-DD'. **현지 시간대**로 센다 — 회의는 현지 시간에 열린다. */
export function dayKeyOf(ms: number): DayKey {
  const at = new Date(ms)
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`
}

/** 밀리초 → ISO 문자열. 저장은 전부 ISO 로 한다. */
export function isoOf(ms: number): string {
  return new Date(ms).toISOString()
}

/** ISO 시각 → '14:05'. 모양이 틀리면 빈 문자열(화면에 NaN 을 띄우지 않는다). */
export function clockOf(iso: string): string {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return ''
  const at = new Date(ms)
  return `${pad(at.getHours())}:${pad(at.getMinutes())}`
}

/**
 * 녹음 시작부터 그 줄까지 지난 밀리초. 녹음 시작이 없으면 null.
 * 녹음 시작보다 이른 줄은 0 으로 본다 — 회의 중에 녹음을 늦게 켜는 일이 흔하고,
 * 그때 음수 시각을 보여 주면 고장처럼 보인다.
 */
export function elapsedMs(recordingStartedAt: string | null, at: string): number | null {
  if (!recordingStartedAt) return null
  const start = Date.parse(recordingStartedAt)
  const mark = Date.parse(at)
  if (Number.isNaN(start) || Number.isNaN(mark)) return null
  return Math.max(0, mark - start)
}

/** 밀리초 → '12:34' 또는 '1:02:03'. 녹음에서 그 지점을 찾을 때 쓰는 꼴이다. */
export function durationLabel(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`
  return `${minutes}:${pad(seconds)}`
}

/** 녹음 기준 경과 시간 라벨. 녹음 시작이 없으면 빈 문자열. */
export function elapsedLabel(recordingStartedAt: string | null, at: string): string {
  const ms = elapsedMs(recordingStartedAt, at)
  if (ms === null) return ''
  return durationLabel(ms)
}

/** 개회부터 폐회까지 걸린 분. 한쪽이라도 비면 null. */
export function minutesBetween(from: string | null, to: string | null): number | null {
  if (!from || !to) return null
  const start = Date.parse(from)
  const end = Date.parse(to)
  if (Number.isNaN(start) || Number.isNaN(end)) return null
  return Math.round((end - start) / 60_000)
}

function parseDayKey(day: DayKey): Date | null {
  if (!DAY_KEY_SHAPE.test(day)) return null
  const [year, month, date] = day.split('-').map(Number)
  const at = new Date(year, month - 1, date)
  // '2026-02-30' 처럼 넘치는 날짜는 다른 달로 흘러간다. 흘러갔으면 가짜다.
  if (at.getMonth() !== month - 1 || at.getDate() !== date) return null
  return at
}

/** '2026년 11월 1일 (일)'. 회의록 머리에 쓴다. 모양이 틀리면 받은 값을 그대로 돌려준다. */
export function koreanDay(day: DayKey): string {
  const at = parseDayKey(day)
  if (!at) return day
  return `${at.getFullYear()}년 ${at.getMonth() + 1}월 ${at.getDate()}일 (${DAY_NAMES[at.getDay()]})`
}

/** '11월 1일 (일)'. 목록에서 쓴다. */
export function koreanDayShort(day: DayKey): string {
  const at = parseDayKey(day)
  if (!at) return day
  return `${at.getMonth() + 1}월 ${at.getDate()}일 (${DAY_NAMES[at.getDay()]})`
}
