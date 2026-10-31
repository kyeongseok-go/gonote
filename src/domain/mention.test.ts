import { describe, expect, test } from 'vitest'
import { parseMention } from './mention'
import { makePerson } from '../test/factories'

const people = [
  makePerson({ id: 'p1', name: '김영수', role: '장로' }),
  makePerson({ id: 'p2', name: '박미경', role: '권사' }),
  makePerson({ id: 'p3', name: '김하늘', role: '집사' }),
  makePerson({ id: 'p4', name: '숨은이', hidden: true }),
]

describe('parseMention', () => {
  test('@ 가 없으면 글만 다듬는다', () => {
    expect(parseMention('  현수막 주문  ', people)).toEqual({
      text: '현수막 주문',
      assigneeId: null,
      assigneeText: '',
    })
  })

  test('이름이 똑같으면 담당자로 붙이고 글에서 떼어 낸다', () => {
    const found = parseMention('현수막 주문 @김영수', people)

    expect(found.text).toBe('현수막 주문')
    expect(found.assigneeId).toBe('p1')
  })

  test('글 중간의 @이름도 알아본다', () => {
    const found = parseMention('@박미경 이 명단을 정리', people)

    expect(found.text).toBe('이 명단을 정리')
    expect(found.assigneeId).toBe('p2')
  })

  test('하나로 정해지면 앞 글자만 적어도 알아본다', () => {
    const found = parseMention('주차 안내 @박', people)

    expect(found.assigneeId).toBe('p2')
    expect(found.text).toBe('주차 안내')
  })

  test('여럿이 걸리면 붙이지 않는다 — 엉뚱한 사람에게 할 일이 가면 담당 미정보다 나쁘다', () => {
    const found = parseMention('성가대 연락 @김', people)

    expect(found.assigneeId).toBeNull()
    // 글은 그대로 남는다. 적은 것이 사라지지 않는다
    expect(found.text).toBe('성가대 연락 @김')
  })

  test('명부에 없는 이름은 글에 그대로 남긴다', () => {
    const found = parseMention('외부 업체 연락 @사장님', people)

    expect(found.assigneeId).toBeNull()
    expect(found.text).toBe('외부 업체 연락 @사장님')
  })

  test('숨긴 사람에게는 붙이지 않는다', () => {
    const found = parseMention('뭔가 @숨은이', people)

    expect(found.assigneeId).toBeNull()
  })

  test('@ 가 여러 개면 마지막 것이 담당자다 — 맡는 사람이 뒤에 온다', () => {
    const found = parseMention('@김영수 말대로 @박미경', people)

    expect(found.assigneeId).toBe('p2')
    expect(found.text).toBe('@김영수 말대로')
  })

  test('이름을 떼어 낸 자리에 공백이 겹치지 않는다', () => {
    const found = parseMention('현수막 @김영수 주문하기', people)

    expect(found.text).toBe('현수막 주문하기')
  })

  test('명부가 비어 있으면 아무것도 붙이지 않는다', () => {
    const found = parseMention('현수막 주문 @김영수', [])

    expect(found.assigneeId).toBeNull()
    expect(found.text).toBe('현수막 주문 @김영수')
  })

  test('@ 하나만 적은 것은 이름이 아니다', () => {
    expect(parseMention('@', people).text).toBe('@')
  })
})
