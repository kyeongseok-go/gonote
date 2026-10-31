// 적은 줄 하나. 눌러서 펼치면 그 자리에서 고친다.
//
// **고치기가 쉬워야 적기가 빨라진다.** 회의 중에는 종류를 틀리게 고르고(발언이라 적었는데
// 결정이었다), 발언자를 못 붙이고, 담당자를 뒤늦게 안다. 그걸 나중에 고칠 수 있다고 믿어야
// 회의 중에 멈추지 않고 적는다.
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useApp } from '../../store/app'
import { nameOf } from '../../domain/minutes'
import { clockOf } from '../../domain/time'
import { ENTRY_KINDS, ENTRY_LABELS, VOTE_LABELS } from '../../domain/types'
import type { Entry, Person, VoteResult } from '../../domain/types'

const RESULTS: readonly VoteResult[] = ['unanimous', 'passed', 'rejected', 'tabled']

interface EntryRowProps {
  entry: Entry
  people: Readonly<Record<string, Person>>
  speaker: string
  /** 녹음 기준 경과 시간. 녹음을 안 켰으면 빈 문자열 */
  elapsed: string
  agendaTitle: string
}

export function EntryRow({ entry, people, speaker, elapsed, agendaTitle }: EntryRowProps) {
  const [open, setOpen] = useState(false)
  const updateEntry = useApp((s) => s.updateEntry)
  const removeEntry = useApp((s) => s.removeEntry)
  const roster = Object.values(people).filter((row) => !row.hidden)

  return (
    <article className={`row row--${entry.kind}`}>
      <button
        type="button"
        className="row__main"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="row__head">
          <span className={`row__kind row__kind--${entry.kind}`}>{ENTRY_LABELS[entry.kind]}</span>
          {speaker ? <span className="row__who">{speaker}</span> : null}
          <span className="row__at tnum">{elapsed || clockOf(entry.at)}</span>
        </span>
        <span className="row__text">{entry.text}</span>
        {entry.kind === 'action' ? (
          <span className="row__tail">
            {entry.assigneeText.trim() || nameOf(people, entry.assigneeId) || '담당 미정'}
            {entry.due ? ` · ${entry.due}까지` : ''}
          </span>
        ) : null}
        {entry.kind === 'decision' && entry.result ? (
          <span className="row__tail">{VOTE_LABELS[entry.result]}</span>
        ) : null}
      </button>

      {open ? (
        <div className="row__edit">
          <label className="row__field">
            <span className="row__label">내용</span>
            <textarea
              className="row__box"
              rows={2}
              value={entry.text}
              onChange={(event) => updateEntry(entry.id, { text: event.target.value })}
            />
          </label>

          <div className="row__field">
            <span className="row__label">종류</span>
            <div className="row__chips" role="group" aria-label="줄 종류 바꾸기">
              {ENTRY_KINDS.map((each) => (
                <button
                  key={each}
                  type="button"
                  className={`chip${entry.kind === each ? ' chip--on' : ''}`}
                  aria-pressed={entry.kind === each}
                  onClick={() => updateEntry(entry.id, { kind: each })}
                >
                  {ENTRY_LABELS[each]}
                </button>
              ))}
            </div>
          </div>

          <div className="row__field">
            <span className="row__label">말한 사람</span>
            <div className="row__chips" role="group" aria-label="말한 사람 고르기">
              {roster.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  className={`chip${entry.speakerId === person.id ? ' chip--on' : ''}`}
                  aria-pressed={entry.speakerId === person.id}
                  onClick={() =>
                    updateEntry(entry.id, { speakerId: entry.speakerId === person.id ? null : person.id })
                  }
                >
                  {person.name}
                </button>
              ))}
              {roster.length === 0 ? <p className="row__none">설정에서 명부를 먼저 만들어 주세요</p> : null}
            </div>
          </div>

          {entry.kind === 'action' ? (
            <>
              <button
                type="button"
                className={`row__done${entry.done ? ' row__done--on' : ''}`}
                aria-pressed={entry.done}
                onClick={() => updateEntry(entry.id, { done: !entry.done })}
              >
                {entry.done ? '끝냈어요' : '아직 안 했어요'}
              </button>
              <div className="row__pair">
              <label className="row__field">
                <span className="row__label">담당</span>
                <input
                  className="row__line"
                  value={entry.assigneeText}
                  placeholder={nameOf(people, entry.assigneeId) || '이름이나 부서'}
                  onChange={(event) => updateEntry(entry.id, { assigneeText: event.target.value })}
                />
              </label>
              <label className="row__field">
                <span className="row__label">기한</span>
                <input
                  className="row__line"
                  type="date"
                  value={entry.due ?? ''}
                  onChange={(event) => updateEntry(entry.id, { due: event.target.value || null })}
                />
              </label>
              </div>
            </>
          ) : null}

          {entry.kind === 'decision' ? (
            <div className="row__field">
              <span className="row__label">표결</span>
              <div className="row__chips" role="group" aria-label="표결 결과">
                {RESULTS.map((each) => (
                  <button
                    key={each}
                    type="button"
                    className={`chip${entry.result === each ? ' chip--on' : ''}`}
                    aria-pressed={entry.result === each}
                    onClick={() => updateEntry(entry.id, { result: entry.result === each ? null : each })}
                  >
                    {VOTE_LABELS[each]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="row__actions">
            {agendaTitle ? <span className="row__agenda">{agendaTitle}</span> : null}
            <button
              type="button"
              className="row__del"
              onClick={() => {
                if (window.confirm('이 줄을 지울까요?')) removeEntry(entry.id)
              }}
            >
              <Trash2 size={15} aria-hidden="true" />
              줄 지우기
            </button>
          </div>
        </div>
      ) : null}
    </article>
  )
}
