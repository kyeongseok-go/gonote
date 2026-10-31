import { describe, expect, test } from 'vitest'
import {
  clockOf,
  dayKeyOf,
  durationLabel,
  elapsedLabel,
  elapsedMs,
  isoOf,
  koreanDay,
  koreanDayShort,
  minutesBetween,
} from './time'

// 어느 함수도 Date.now() 를 부르지 않는다. 지금·오늘은 늘 인자로 받는다.
// 그래서 월말·연말·자정 넘김을 모킹 없이 직접 넣어 본다.

describe('dayKeyOf', () => {
  test('현지 시간대의 날짜를 돌려준다', () => {
    const ms = new Date(2026, 10, 1, 9, 30).getTime()

    expect(dayKeyOf(ms)).toBe('2026-11-01')
  })

  test('한 자리 월·일을 0 으로 채운다', () => {
    expect(dayKeyOf(new Date(2026, 0, 5, 12, 0).getTime())).toBe('2026-01-05')
  })

  test('자정 직전과 직후가 다른 날이다', () => {
    const before = dayKeyOf(new Date(2026, 10, 1, 23, 59, 59).getTime())
    const after = dayKeyOf(new Date(2026, 10, 2, 0, 0, 1).getTime())

    expect(before).toBe('2026-11-01')
    expect(after).toBe('2026-11-02')
  })
})

describe('clockOf', () => {
  test('ISO 시각을 24시간 시계로 바꾼다', () => {
    const iso = isoOf(new Date(2026, 10, 1, 14, 5).getTime())

    expect(clockOf(iso)).toBe('14:05')
  })

  test('오전 한 자리 시각도 두 자리로 적는다', () => {
    const iso = isoOf(new Date(2026, 10, 1, 9, 7).getTime())

    expect(clockOf(iso)).toBe('09:07')
  })

  test('모양이 틀린 값에는 빈 문자열을 돌려준다 — 화면에 NaN 을 띄우지 않는다', () => {
    expect(clockOf('어제')).toBe('')
    expect(clockOf('')).toBe('')
  })
})

describe('elapsedMs / elapsedLabel', () => {
  test('녹음 시작부터 지난 시간을 잰다', () => {
    const start = isoOf(new Date(2026, 10, 1, 10, 0, 0).getTime())
    const at = isoOf(new Date(2026, 10, 1, 10, 12, 34).getTime())

    expect(elapsedMs(start, at)).toBe((12 * 60 + 34) * 1000)
    expect(elapsedLabel(start, at)).toBe('12:34')
  })

  test('한 시간을 넘기면 시간을 앞에 붙인다', () => {
    const start = isoOf(new Date(2026, 10, 1, 10, 0, 0).getTime())
    const at = isoOf(new Date(2026, 10, 1, 11, 2, 3).getTime())

    expect(elapsedLabel(start, at)).toBe('1:02:03')
  })

  test('녹음 시작이 없으면 경과 시간도 없다', () => {
    expect(elapsedMs(null, isoOf(Date.parse('2026-11-01T10:00:00Z')))).toBeNull()
    expect(elapsedLabel(null, isoOf(Date.parse('2026-11-01T10:00:00Z')))).toBe('')
  })

  test('녹음 시작보다 이른 줄은 0 으로 본다 — 음수 시각을 보여 주지 않는다', () => {
    const start = isoOf(new Date(2026, 10, 1, 10, 0, 0).getTime())
    const at = isoOf(new Date(2026, 10, 1, 9, 59, 0).getTime())

    expect(elapsedMs(start, at)).toBe(0)
    expect(elapsedLabel(start, at)).toBe('0:00')
  })
})

describe('durationLabel', () => {
  test('밀리초를 분·초로 적는다', () => {
    expect(durationLabel(0)).toBe('0:00')
    expect(durationLabel(9_000)).toBe('0:09')
    expect(durationLabel(754_000)).toBe('12:34')
  })
})

describe('minutesBetween', () => {
  test('개회부터 폐회까지 걸린 분을 센다', () => {
    const opened = isoOf(new Date(2026, 10, 1, 10, 0).getTime())
    const closed = isoOf(new Date(2026, 10, 1, 11, 25).getTime())

    expect(minutesBetween(opened, closed)).toBe(85)
  })

  test('한쪽이 비면 셀 수 없다', () => {
    expect(minutesBetween(null, isoOf(0))).toBeNull()
    expect(minutesBetween(isoOf(0), null)).toBeNull()
  })
})

describe('koreanDay', () => {
  test('회의록 머리에 쓰는 날짜를 만든다', () => {
    expect(koreanDay('2026-11-01')).toBe('2026년 11월 1일 (일)')
  })

  test('요일을 맞게 붙인다', () => {
    expect(koreanDay('2026-11-02')).toBe('2026년 11월 2일 (월)')
  })

  test('짧은 꼴은 목록에서 쓴다', () => {
    expect(koreanDayShort('2026-11-01')).toBe('11월 1일 (일)')
  })

  test('모양이 틀리면 받은 값을 그대로 돌려준다 — 화면이 비어 버리지 않게', () => {
    expect(koreanDay('언젠가')).toBe('언젠가')
  })
})
