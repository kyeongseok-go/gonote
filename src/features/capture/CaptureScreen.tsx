// 받아적기 화면. **이 앱의 심장이다.**
//
// 모양을 대화창처럼 잡았다 — 기록이 위로 쌓이고 입력은 아래 고정이다.
// 교회에서 쓰는 앱이라 카톡과 같은 모양이면 설명할 것이 없고, 엄지가 닿는 자리에 입력이 온다.
//
// 회의는 기다려 주지 않는다. 그래서:
//  - 종류는 **미리 골라 둔 채로** 유지된다(발언을 연달아 적는 게 보통이다)
//  - 발언자는 **한 번 누르면 다음 줄까지 유지**된다. 같은 사람이 이어 말하는 일이 많다
//  - 엔터로 넣는다(데스크톱). 폰에서는 넣기 버튼
//  - 넣자마자 입력칸이 비고 포커스가 남는다. 다음 줄을 바로 적을 수 있다
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, FileText, Mic, Plus, Square } from 'lucide-react'
import { useApp } from '../../store/app'
import { buildMinutes, nameOf, nextOrder } from '../../domain/minutes'
import { clockOf, elapsedLabel } from '../../domain/time'
import { ENTRY_HINTS, ENTRY_KINDS, ENTRY_LABELS } from '../../domain/types'
import type { EntryKind } from '../../domain/types'
import { EntryRow } from './EntryRow'
import { AgendaBar } from './AgendaBar'
import { TemplatePick } from './TemplatePick'
import { SpeakerBar } from './SpeakerBar'
import './capture.css'

export function CaptureScreen() {
  const { id = '' } = useParams()
  const ready = useApp((s) => s.ready)
  const entities = useApp((s) => s.entities)
  const addEntry = useApp((s) => s.addEntry)
  const openMeeting = useApp((s) => s.openMeeting)
  const markRecordingStart = useApp((s) => s.markRecordingStart)
  const clearRecordingStart = useApp((s) => s.clearRecordingStart)

  const meeting = entities.meetings[id]
  const [kind, setKind] = useState<EntryKind>('speech')
  const [speakerId, setSpeakerId] = useState<string | null>(null)
  const [agendaId, setAgendaId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const box = useRef<HTMLTextAreaElement>(null)
  const tail = useRef<HTMLDivElement>(null)

  // 회의 화면에 들어오는 순간이 곧 개회다. 따로 누르게 하면 아무도 누르지 않는다.
  useEffect(() => {
    if (meeting && !meeting.openedAt) openMeeting(meeting.id)
  }, [meeting, openMeeting])

  const entries = useMemo(
    () =>
      Object.values(entities.entries)
        .filter((row) => row.meetingId === id)
        .sort((a, b) => a.order - b.order),
    [entities.entries, id],
  )

  const agendas = useMemo(
    () =>
      Object.values(entities.agendas)
        .filter((row) => row.meetingId === id)
        .sort((a, b) => a.order - b.order),
    [entities.agendas, id],
  )

  // '지금 안건' 은 **렌더에서 유도한다.** 효과로 state 를 채우면 한 박자 늦게 반영되고
  // 그 사이에 적은 줄이 안건 없이 들어간다. 고른 것이 없거나 그 안건이 지워졌으면 마지막 안건을 쓴다.
  const picked = agendaId !== null && agendas.some((row) => row.id === agendaId) ? agendaId : null
  const currentAgendaId = picked ?? agendas.at(-1)?.id ?? null

  // 줄이 늘면 맨 아래로 내린다. 적은 줄이 화면 밖에 있으면 적힌 줄 알 수 없다.
  //
  // scrollIntoView 가 없는 환경이 있다(구형 웹뷰, 테스트 환경). 그냥 부르면 그 자리에서 터져
  // **회의 중에 화면이 통째로 날아간다.** 있을 때만 부른다.
  useEffect(() => {
    const end = tail.current
    if (typeof end?.scrollIntoView === 'function') end.scrollIntoView({ block: 'end' })
  }, [entries.length])

  if (!ready) return <p className="cap__wait">읽는 중이에요…</p>
  if (!meeting) {
    return (
      <main className="cap__gone">
        <h1>회의를 찾지 못했어요</h1>
        <Link to="/" className="btn btn--plain">
          회의 목록으로
        </Link>
      </main>
    )
  }

  const doc = buildMinutes({ meeting, people: entities.people, agendas: entities.agendas, entries: entities.entries })

  const submit = () => {
    if (text.trim().length === 0) return
    addEntry({ meetingId: meeting.id, kind, text, agendaId: currentAgendaId, speakerId })
    setText('')
    // 포커스를 유지한다. 폰에서 키보드가 내려가면 다음 줄을 적기까지 두 번 더 눌러야 한다.
    box.current?.focus()
  }

  const recording = meeting.recordingStartedAt !== null

  return (
    <main className="cap">
      <header className="cap__top">
        <Link to="/" className="cap__back" aria-label="회의 목록으로">
          <ChevronLeft size={22} aria-hidden="true" />
        </Link>
        <Link to={`/m/${meeting.id}/info`} className="cap__title">
          <h1>{meeting.title}</h1>
          <p className="cap__meta">
            {meeting.openedAt ? `${clockOf(meeting.openedAt)} 개회` : '개회 전'} · 적은 줄 {entries.length}개
            {doc.attendance.total > 0 ? ` · 참석 ${doc.attendance.presentCount}명` : ' · 참석자 넣기'}
          </p>
        </Link>
        <Link to={`/m/${meeting.id}/doc`} className="cap__doc">
          <FileText size={18} aria-hidden="true" />
          회의록
        </Link>
      </header>

      <div className="cap__rec">
        <button
          type="button"
          className={`cap__recbtn${recording ? ' cap__recbtn--on' : ''}`}
          onClick={() => (recording ? clearRecordingStart(meeting.id) : markRecordingStart(meeting.id))}
          aria-pressed={recording}
        >
          {recording ? <Square size={15} aria-hidden="true" /> : <Mic size={15} aria-hidden="true" />}
          {recording ? '녹음 기준 맞춰져 있어요' : '폰으로 녹음 시작했어요'}
        </button>
        <p className="cap__rechint">
          {recording
            ? '적는 줄마다 녹음 몇 분 몇 초인지 붙어요. 나중에 그 지점만 들어 보면 돼요.'
            : '폰 음성 메모로 녹음을 켠 뒤 이 버튼을 누르면, 줄마다 녹음 시각이 붙어요.'}
        </p>
      </div>

      <AgendaBar meetingId={meeting.id} agendas={agendas} currentId={currentAgendaId} onPick={setAgendaId} />

      <section className="cap__list" aria-label="적은 기록">
        {entries.length === 0 && agendas.length === 0 ? <TemplatePick meetingId={meeting.id} /> : null}
        {entries.length === 0 ? (
          <div className="cap__empty">
            <p className="cap__empty-title">아직 적은 것이 없어요</p>
            <p>
              아래에서 종류를 고르고 적으면 돼요. <strong>폰 키보드의 마이크</strong>를 누르면 말로 적을 수
              있어요.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              people={entities.people}
              speaker={nameOf(entities.people, entry.speakerId)}
              elapsed={elapsedLabel(meeting.recordingStartedAt, entry.at)}
              agendaTitle={entry.agendaId ? (entities.agendas[entry.agendaId]?.title ?? '') : ''}
            />
          ))
        )}
        <div ref={tail} />
      </section>

      <div className="cap__dock">
        <SpeakerBar
          meeting={meeting}
          people={entities.people}
          currentId={speakerId}
          onPick={(next) => setSpeakerId(next === speakerId ? null : next)}
        />

        <div className="cap__kinds" role="group" aria-label="줄 종류">
          {ENTRY_KINDS.map((each) => (
            <button
              key={each}
              type="button"
              className={`cap__kind cap__kind--${each}${kind === each ? ' cap__kind--on' : ''}`}
              aria-pressed={kind === each}
              onClick={() => setKind(each)}
            >
              {ENTRY_LABELS[each]}
            </button>
          ))}
        </div>

        <div className="cap__input">
          <textarea
            ref={box}
            className="cap__box"
            value={text}
            rows={2}
            placeholder={ENTRY_HINTS[kind]}
            aria-label={`${ENTRY_LABELS[kind]} 내용`}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              // 데스크톱에서는 엔터로 넣는다. 줄바꿈은 Shift+Enter.
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                submit()
              }
            }}
          />
          <button type="button" className="cap__send" onClick={submit} disabled={text.trim().length === 0}>
            <Plus size={20} aria-hidden="true" />
            넣기
          </button>
        </div>
        <p className="cap__tip">
          {nextOrder(entities.entries, meeting.id) === 0
            ? '말로 적어도 돼요 — 키보드의 마이크를 누르세요'
            : `${ENTRY_LABELS[kind]}으로 들어가요${speakerId ? ` · ${nameOf(entities.people, speakerId)}` : ''}`}
        </p>
      </div>
    </main>
  )
}
