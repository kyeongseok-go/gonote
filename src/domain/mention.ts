// `@이름` 으로 담당자를 지정한다.
//
// 할 일을 적을 때 담당자를 고르려면 손을 입력칸에서 떼야 하고, 회의 중에는 그 한 번이 비싸다.
// "현수막 주문 @김영수" 처럼 한 줄로 적으면 이름이 떨어져 나가 담당자로 붙는다.
// (Obsidian 회의록 템플릿의 `@owner` 문법에서 가져왔다 — research/refs-products.md)
//
// 못 알아본 `@무엇` 은 **지우지 않고 글에 그대로 남긴다.** 적은 것이 사라지는 쪽이 늘 더 나쁘다.
import type { Person } from './types'

export interface Mentioned {
  /** `@이름` 을 떼어 낸 글 */
  text: string
  /** 알아본 사람. 명부에 없으면 null */
  assigneeId: string | null
  /** 알아보지 못했지만 사람 이름처럼 보이는 것. 담당 칸에 글로 넣는다 */
  assigneeText: string
}

/** 글 끝이나 중간의 `@이름` 을 찾는다. 이름에 공백은 없다고 본다(한국 이름은 붙여 쓴다). */
const MENTION = /@([^\s@]{1,20})/g

/**
 * `@이름` 을 찾아 명부의 사람과 맞춘다.
 *
 * 맞추는 순서: 이름이 똑같은 사람 → 이름이 그 글자로 시작하는 사람(성만 적었을 때).
 * 둘 다 **하나로 정해질 때만** 붙인다. 여럿이 걸리면 사람이 고르게 둬야 한다 —
 * 엉뚱한 사람에게 할 일이 붙는 쪽이 담당 미정보다 나쁘다.
 */
export function parseMention(raw: string, people: readonly Person[]): Mentioned {
  const roster = people.filter((person) => !person.hidden)
  const hits = [...raw.matchAll(MENTION)]
  if (hits.length === 0) return { text: raw.trim(), assigneeId: null, assigneeText: '' }

  // 마지막 것만 본다. "@김영수 말대로 @박미경 이 맡기로" 같은 글에서는 맡는 사람이 뒤에 온다.
  const hit = hits[hits.length - 1]
  const typed = hit[1]

  const exact = roster.filter((person) => person.name === typed)
  const starts = roster.filter((person) => person.name.startsWith(typed))
  const matched = exact.length === 1 ? exact[0] : starts.length === 1 ? starts[0] : null

  // 알아본 경우에만 글에서 떼어 낸다.
  if (!matched) {
    return { text: raw.trim(), assigneeId: null, assigneeText: '' }
  }

  const text = `${raw.slice(0, hit.index)}${raw.slice(hit.index + hit[0].length)}`
    .replace(/\s{2,}/g, ' ')
    .trim()
  return { text, assigneeId: matched.id, assigneeText: '' }
}
