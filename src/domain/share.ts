// 카톡에 붙이는 글. **PDF 가 아니라 이것이 실제로 읽히는 산출물이다.**
//
// 카톡에 PDF 를 올리면 열어 보는 사람이 절반으로 줄고, 열어도 폰에서 두 손으로 확대해야 한다.
// 결정과 할 일은 **대화창에서 바로 보여야** 읽힌다. 그래서 글 자체를 산출물로 만든다.
//
// 규칙:
//  - 마크다운을 쓰지 않는다. 카톡은 `**굵게**` 를 그냥 별표로 보여 준다
//  - 이모지를 쓰지 않는다. 교회 공식 기록이고, 기기마다 다르게 보인다
//  - 구조는 들여쓰기와 소수의 기호(■ · -)로만 만든다
//  - 결정에는 번호를 붙인다. 카톡에서 "2번 말씀인데요" 로 가리킬 수 있어야 한다
import { nameOf, sectionTitle, timeLabel } from './minutes'
import type { MinutesDoc } from './minutes'
import { koreanDay } from './time'
import { VOTE_LABELS } from './types'
import type { Entry, Meeting } from './types'

export interface ShareOptions {
  /** 안건별 발언 기록까지 넣을까. 끄면 결정·할 일만 남는다 */
  includeSpeech: boolean
  /**
   * 발언자 이름을 직분으로 바꿀까.
   *
   * **원본과 공개본을 나누는 장치다.** 회의록 원본(인쇄·PDF)은 누가 말했는지 실명으로
   * 남겨야 기록으로서 의미가 있지만(공동주택관리법 시행령 18조는 반대 의견자의 성명 기재를
   * 요구한다), 카톡방처럼 더 넓게 돌아가는 자리에서는 개인정보보호위원회가 열람 시
   * 익명·가명처리를 권한다. 법제처는 회의록의 발언 내용 자체를 개인정보로 본다.
   * 그 둘을 한 문서로 만족시킬 수 없어서 **공유 글에만** 이 스위치를 뒀다.
   * (research/refs-church.md)
   */
  hideNames?: boolean
}

/**
 * 밖으로 나가도 되는 줄인가.
 *
 * **`메모` 는 절대 나가지 않는다.** 서기가 자기만 보려고 적는 자리이기 때문이다 —
 * "이 사람 말이 길다", "이건 나중에 따로 확인" 같은 것이 카톡방에 올라가면 사고가 된다.
 * 레퍼런스 제품들이 내부용·외부용 회의록을 나누는 것과 같은 이유다(research/refs-products.md).
 */
export function isShareable(entry: Entry): boolean {
  return entry.kind !== 'memo'
}

/** 'YYYY-MM-DD' → '11월 8일'. 기한처럼 짧게 쓰는 자리. */
function shortDue(due: string): string {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(due)
  if (!match) return due
  return `${Number(match[1])}월 ${Number(match[2])}일`
}

/** '본당 2층 회의실 · 참석 9/10' — 빈 조각은 넣지 않는다. */
function placeLine(doc: MinutesDoc): string {
  const parts = [doc.meeting.place.trim(), `참석 ${doc.attendance.presentCount}/${doc.attendance.total}`]
  return parts.filter((part) => part.length > 0).join(' · ')
}

/** 할 일 한 줄. **담당자 이름은 익명화하지 않는다** — 누가 맡았는지 모르면 할 일이 아니다. */
function actionLine(doc: MinutesDoc, action: Entry): string {
  const owner = action.assigneeText.trim() || nameOf(doc.people, action.assigneeId)
  const tail = [owner, action.due ? `${shortDue(action.due)}까지` : '']
    .filter((part) => part.length > 0)
    .join(' · ')
  const mark = action.done ? ' (완료)' : ''
  return tail ? `· ${action.text}${mark} — ${tail}` : `· ${action.text}${mark}`
}

function decisionLine(decision: Entry, index: number): string {
  const result = decision.result ? ` (${VOTE_LABELS[decision.result]})` : ''
  return `${index + 1}. ${decision.text}${result}`
}

/** 결정 묶음. 비어 있으면 '없음' 을 적는다 — 빈 칸은 빠뜨린 것처럼 보인다. */
function decisionBlock(doc: MinutesDoc): string[] {
  if (doc.decisions.length === 0) return ['■ 결정 사항', '결정된 사항 없음']
  return ['■ 결정 사항', ...doc.decisions.map(decisionLine)]
}

function actionBlock(doc: MinutesDoc): string[] {
  if (doc.actions.length === 0) return []
  return ['■ 할 일', ...doc.actions.map((action) => actionLine(doc, action))]
}

/** 공유 글에서 사람을 어떻게 부를까. 익명화를 켜면 직분으로, 직분이 없으면 '참석자' 로 */
function who(doc: MinutesDoc, id: string | null, hide: boolean): string {
  if (!id) return ''
  if (!hide) return nameOf(doc.people, id)
  const person = doc.people[id]
  if (!person) return ''
  return person.role.trim() || '참석자'
}

function speechBlock(doc: MinutesDoc, hide: boolean): string[] {
  const sections = doc.sections
    .map((row) => ({ ...row, entries: row.entries.filter(isShareable) }))
    .filter((row) => row.entries.length > 0)
  if (sections.length === 0) return []

  const lines = ['■ 안건별 기록']
  sections.forEach((row, index) => {
    lines.push(`${index + 1}) ${sectionTitle(row.agenda)}`)
    for (const entry of row.entries) {
      const said = who(doc, entry.speakerId, hide)
      if (entry.kind === 'decision') lines.push(`   - 결정: ${entry.text}`)
      else if (entry.kind === 'action') lines.push(`   - 할 일: ${entry.text}`)
      else if (said) lines.push(`   - ${said}: ${entry.text}`)
      else lines.push(`   - ${entry.text}`)
    }
  })
  return lines
}

/** 빈 줄로 묶음을 나누고, 빈 줄이 겹치지 않게 정리한다. */
function joinBlocks(blocks: string[][]): string {
  return blocks
    .filter((block) => block.length > 0)
    .map((block) => block.join('\n'))
    .join('\n\n')
}

/** 카톡에 붙이는 전체 회의록. */
export function shareText(doc: MinutesDoc, options: ShareOptions): string {
  const head = [`[${doc.meeting.title.trim() || '회의록'}]`, koreanDay(doc.meeting.date)]
  const range = timeLabel(doc.meeting)
  if (range) head[1] = `${head[1]} ${range}`
  head.push(placeLine(doc))

  const blocks = [head, decisionBlock(doc), actionBlock(doc)]
  if (options.includeSpeech) blocks.push(speechBlock(doc, options.hideNames === true))

  const scribe = doc.meeting.scribe.trim()
  if (scribe) blocks.push([`작성 ${scribe}`])

  return joinBlocks(blocks)
}

/** 결정과 할 일만. 카톡에 실제로 가장 많이 올라가는 꼴이다. */
export function summaryText(doc: MinutesDoc): string {
  return joinBlocks([
    [`[${doc.meeting.title.trim() || '회의록'}] 결정·할 일`, koreanDay(doc.meeting.date)],
    decisionBlock(doc),
    actionBlock(doc),
  ])
}

/** 내려받기·인쇄에 쓰는 파일 이름. 파일 이름에 못 쓰는 글자를 치운다. */
export function fileNameOf(meeting: Meeting): string {
  const title = meeting.title
    .trim()
    .replace(/[/\\]/g, '-')
    .replace(/[:]/g, ' -')
    .replace(/[*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return `${meeting.date}_${title || '회의록'}`
}
