// 회의록 문서. **이 화면이 그대로 인쇄되고, 그대로 PDF 가 된다.**
//
// 화면용 레이아웃과 인쇄용 레이아웃을 따로 만들지 않았다. 따로 만들면 둘이 어긋나고,
// 사람은 화면에서 본 것이 인쇄될 거라고 믿는다. `minutes.css` 의 @media print 가 같은
// 마크업을 A4 에 맞춘다.
//
// 라이브러리로 PDF 를 만들지 않는 이유: 한글 글꼴을 번들해야 하고(수 MB), 줄바꿈 규칙이
// 브라우저와 달라져 글자가 깨진다. 브라우저 인쇄 → 'PDF 로 저장' 이 가장 정확하고 가볍다.
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Copy, Printer, Share2 } from 'lucide-react'
import { useApp } from '../../store/app'
import { buildMinutes, nameOf, sectionTitle } from '../../domain/minutes'
import { fileNameOf, isShareable, shareText, summaryText } from '../../domain/share'
import { clockOf, koreanDay } from '../../domain/time'
import { ATTENDANCE_LABELS, ENTRY_LABELS, VOTE_LABELS } from '../../domain/types'
import type { Entry, Person } from '../../domain/types'
import './minutes.css'

/** 참석자 한 줄. '김영수 장로, 박미경 권사' */
function nameList(people: readonly Person[]): string {
  return people
    .map((person) => (person.role ? `${person.name} ${person.role}` : person.name))
    .join(', ')
}

export function MinutesScreen() {
  const { id = '' } = useParams()
  const ready = useApp((s) => s.ready)
  const entities = useApp((s) => s.entities)
  const settings = useApp((s) => s.settings)
  const [copied, setCopied] = useState<string | null>(null)

  const meeting = entities.meetings[id]
  const doc = useMemo(
    () =>
      meeting
        ? buildMinutes({
            meeting,
            people: entities.people,
            agendas: entities.agendas,
            entries: entities.entries,
          })
        : null,
    [meeting, entities.people, entities.agendas, entities.entries],
  )

  if (!ready) return <p className="min__wait">읽는 중이에요…</p>
  if (!meeting || !doc) {
    return (
      <main className="min__gone">
        <h1>회의를 찾지 못했어요</h1>
        <Link to="/" className="btn btn--plain">
          회의 목록으로
        </Link>
      </main>
    )
  }

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(`${what}을 복사했어요. 카톡에 붙여 넣으면 돼요.`)
    } catch {
      // 클립보드가 막힌 환경(사생활 보호 창, 권한 거부)에서는 글을 직접 고를 수 있게 알려 준다.
      setCopied('복사가 막혀 있어요. 아래 글을 길게 눌러 직접 복사해 주세요.')
    }
  }

  const full = shareText(doc, { includeSpeech: settings.shareIncludesSpeech })
  const short = summaryText(doc)

  const share = async () => {
    // navigator.share 는 아이폰 사파리에서 카톡으로 바로 보낼 수 있는 유일한 길이다.
    // 없는 환경(데스크톱 일부)에서는 복사로 떨어진다.
    if (typeof navigator.share !== 'function') {
      await copy(full, '회의록')
      return
    }
    try {
      await navigator.share({ title: meeting.title, text: full })
    } catch {
      // 사용자가 공유 창을 닫은 것도 여기로 온다. 알릴 것이 없다.
    }
  }

  return (
    <main className="min">
      <header className="min__bar">
        <Link to={`/m/${meeting.id}`} className="min__back" aria-label="받아적기로 돌아가기">
          <ChevronLeft size={22} aria-hidden="true" />
        </Link>
        <h1 className="min__bartitle">회의록</h1>
        <button type="button" className="min__barbtn" onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" />
          인쇄 · PDF
        </button>
      </header>

      <div className="min__tools">
        <button type="button" className="btn btn--accent" onClick={share}>
          <Share2 size={17} aria-hidden="true" />
          회의록 공유
        </button>
        <button type="button" className="btn btn--plain" onClick={() => copy(short, '결정·할 일')}>
          <Copy size={17} aria-hidden="true" />
          결정·할 일만 복사
        </button>
        <button type="button" className="btn btn--plain" onClick={() => copy(full, '회의록 전체')}>
          <Copy size={17} aria-hidden="true" />
          전체 복사
        </button>
      </div>
      {copied ? (
        <p className="min__said" role="status">
          {copied}
        </p>
      ) : null}

      {/* 여기서부터가 인쇄되는 부분이다 */}
      <article className="paper" aria-label="회의록 문서">
        <header className="paper__head">
          <p className="paper__kind">{meeting.kind || '회의록'}</p>
          <h2 className="paper__title">{meeting.title}</h2>

          <dl className="paper__facts">
            <div>
              <dt>일시</dt>
              <dd>
                {koreanDay(meeting.date)}
                {meeting.openedAt ? ` ${clockOf(meeting.openedAt)}` : ''}
                {meeting.closedAt ? `~${clockOf(meeting.closedAt)}` : ''}
                {doc.durationMinutes !== null ? ` (${doc.durationMinutes}분)` : ''}
              </dd>
            </div>
            {meeting.place ? (
              <div>
                <dt>장소</dt>
                <dd>{meeting.place}</dd>
              </div>
            ) : null}
            {doc.attendance.total > 0 ? (
              <div>
                <dt>성원</dt>
                <dd>
                  재적 {doc.attendance.total}명 중 {doc.attendance.presentCount}명 참석
                </dd>
              </div>
            ) : null}
            {meeting.scribe ? (
              <div>
                <dt>서기</dt>
                <dd>{meeting.scribe}</dd>
              </div>
            ) : null}
          </dl>

          {doc.attendance.total > 0 ? (
            <dl className="paper__people">
              {doc.attendance.present.length > 0 ? (
                <div>
                  <dt>{ATTENDANCE_LABELS.present}</dt>
                  <dd>{nameList(doc.attendance.present)}</dd>
                </div>
              ) : null}
              {doc.attendance.late.length > 0 ? (
                <div>
                  <dt>{ATTENDANCE_LABELS.late}</dt>
                  <dd>{nameList(doc.attendance.late)}</dd>
                </div>
              ) : null}
              {doc.attendance.absent.length > 0 ? (
                <div>
                  <dt>{ATTENDANCE_LABELS.absent}</dt>
                  <dd>{nameList(doc.attendance.absent)}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </header>

        {/* 결정과 할 일을 맨 위에 둔다. 회의록을 받은 사람이 읽는 것은 사실상 이 두 가지다. */}
        <section className="paper__block">
          <h3 className="paper__h">결정 사항</h3>
          {doc.decisions.length === 0 ? (
            <p className="paper__none">결정된 사항 없음</p>
          ) : (
            <ol className="paper__decisions">
              {doc.decisions.map((row) => (
                <li key={row.id}>
                  <span className="paper__dtext">{row.text}</span>
                  {row.result ? <span className="paper__vote">{VOTE_LABELS[row.result]}</span> : null}
                  <Votes entry={row} />
                </li>
              ))}
            </ol>
          )}
        </section>

        {doc.actions.length > 0 ? (
          <section className="paper__block">
            <h3 className="paper__h">할 일</h3>
            <table className="paper__actions">
              <thead>
                <tr>
                  <th scope="col">할 일</th>
                  <th scope="col">담당</th>
                  <th scope="col">기한</th>
                </tr>
              </thead>
              <tbody>
                {doc.actions.map((row) => (
                  <tr key={row.id}>
                    <td>{row.text}</td>
                    <td>{row.assigneeText.trim() || nameOf(entities.people, row.assigneeId) || '—'}</td>
                    <td className="tnum">{row.due ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <section className="paper__block">
          <h3 className="paper__h">안건별 기록</h3>
          {doc.sections.every((row) => row.entries.filter(isShareable).length === 0) ? (
            <p className="paper__none">기록된 발언 없음</p>
          ) : (
            doc.sections.map((row, index) => {
              const shown = row.entries.filter(isShareable)
              if (shown.length === 0) return null
              return (
                <div key={row.agenda?.id ?? 'loose'} className="paper__agenda">
                  <h4 className="paper__ah">
                    <span className="paper__ano tnum">{index + 1}.</span> {sectionTitle(row.agenda)}
                    {row.agenda?.result ? (
                      <span className="paper__vote">{VOTE_LABELS[row.agenda.result]}</span>
                    ) : null}
                  </h4>
                  <ul className="paper__lines">
                    {shown.map((entry) => (
                      <li key={entry.id} className={`paper__line paper__line--${entry.kind}`}>
                        {entry.kind === 'speech' ? (
                          <>
                            {nameOf(entities.people, entry.speakerId) ? (
                              <span className="paper__who">{nameOf(entities.people, entry.speakerId)}</span>
                            ) : null}
                            {entry.text}
                          </>
                        ) : (
                          <>
                            <span className="paper__tag">{ENTRY_LABELS[entry.kind]}</span>
                            {entry.text}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })
          )}
        </section>

        {meeting.nextMeetingNote ? (
          <section className="paper__block">
            <h3 className="paper__h">다음 회의</h3>
            <p className="paper__next">{meeting.nextMeetingNote}</p>
          </section>
        ) : null}

        <footer className="paper__foot">
          <p>
            {meeting.closedAt ? `${clockOf(meeting.closedAt)} 폐회` : '폐회 시각 미기록'}
            {meeting.scribe ? ` · 서기 ${meeting.scribe}` : ''}
          </p>
          <p className="paper__file">{fileNameOf(meeting)}</p>
        </footer>
      </article>

      <section className="min__preview">
        <h2 className="min__ph">카톡에 붙는 모양</h2>
        <pre className="min__pre">{settings.shareIncludesSpeech ? full : short}</pre>
        <p className="min__phint">
          설정에서 발언 기록까지 넣을지 고를 수 있어요. 지금은{' '}
          {settings.shareIncludesSpeech ? '전체' : '결정·할 일만'} 들어가요.
        </p>
      </section>
    </main>
  )
}

/** 찬성·반대·기권 수. 센 것만 보여 준다 — 안 센 것과 0 은 다르다. */
function Votes({ entry }: { entry: Entry }) {
  const parts = [
    entry.vote.for !== null ? `찬성 ${entry.vote.for}` : '',
    entry.vote.against !== null ? `반대 ${entry.vote.against}` : '',
    entry.vote.abstain !== null ? `기권 ${entry.vote.abstain}` : '',
  ].filter((part) => part.length > 0)
  if (parts.length === 0) return null
  return <span className="paper__votes tnum">{parts.join(' · ')}</span>
}
