// 회의 정보. 회의록 **머리말**이 되는 것들과 **참석(성원)** 을 여기서 고친다.
//
// 회의 시작 화면에서 이걸 먼저 묻지 않는 이유: 회의는 늘 급하게 시작되고, 이 화면을 채우는
// 동안 앞부분을 놓친다. 그래서 먼저 적게 하고 **여기로 돌아와 채운다.**
//
// 참석 체크가 비어 있으면 회의록에 성원 보고가 안 들어간다. 교단 규정은 회원 점명을
// 회무 처리의 첫 순서로 두고 있다(research/refs-church.md).
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Trash2, UserPlus } from 'lucide-react'
import { useApp } from '../../store/app'
import { attendanceOf, personLabel } from '../../domain/minutes'
import { ATTENDANCE_LABELS } from '../../domain/types'
import type { Attendance } from '../../domain/types'
import './info.css'

const STATES: readonly Attendance[] = ['present', 'late', 'absent']

export function MeetingInfo() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const ready = useApp((s) => s.ready)
  const entities = useApp((s) => s.entities)
  const updateMeeting = useApp((s) => s.updateMeeting)
  const setAttendance = useApp((s) => s.setAttendance)
  const removeAttendee = useApp((s) => s.removeAttendee)
  const removeMeeting = useApp((s) => s.removeMeeting)
  const closeMeeting = useApp((s) => s.closeMeeting)

  const meeting = entities.meetings[id]
  if (!ready) return <p className="inf__wait">읽는 중이에요…</p>
  if (!meeting) {
    return (
      <main className="inf">
        <h1>회의를 찾지 못했어요</h1>
        <Link to="/" className="btn btn--plain">
          회의 목록으로
        </Link>
      </main>
    )
  }

  const roster = Object.values(entities.people).filter((row) => !row.hidden)
  const summary = attendanceOf(meeting, entities.people)
  const stateOf = (personId: string): Attendance | null =>
    meeting.attendees.find((row) => row.personId === personId)?.attendance ?? null

  return (
    <main className="inf">
      <header className="inf__top">
        <Link to={`/m/${meeting.id}`} className="inf__back" aria-label="받아적기로 돌아가기">
          <ChevronLeft size={22} aria-hidden="true" />
        </Link>
        <h1>회의 정보</h1>
      </header>

      <section className="inf__block">
        <label className="inf__field">
          <span>회의 이름</span>
          <input
            value={meeting.title}
            onChange={(event) => updateMeeting(meeting.id, { title: event.target.value })}
          />
        </label>
        <div className="inf__pair">
          <label className="inf__field">
            <span>종류</span>
            <input
              value={meeting.kind}
              placeholder="제직회"
              onChange={(event) => updateMeeting(meeting.id, { kind: event.target.value })}
            />
          </label>
          <label className="inf__field">
            <span>날짜</span>
            <input
              type="date"
              value={meeting.date}
              onChange={(event) => updateMeeting(meeting.id, { date: event.target.value || meeting.date })}
            />
          </label>
        </div>
        <label className="inf__field">
          <span>장소</span>
          <input
            value={meeting.place}
            placeholder="본당 2층 회의실"
            onChange={(event) => updateMeeting(meeting.id, { place: event.target.value })}
          />
        </label>
        <label className="inf__field">
          <span>서기(작성자)</span>
          <input
            value={meeting.scribe}
            placeholder="이름"
            onChange={(event) => updateMeeting(meeting.id, { scribe: event.target.value })}
          />
        </label>
        <label className="inf__field">
          <span>다음 회의</span>
          <input
            value={meeting.nextMeetingNote}
            placeholder="12월 6일 (토) 오전 10시"
            onChange={(event) => updateMeeting(meeting.id, { nextMeetingNote: event.target.value })}
          />
        </label>
      </section>

      <section className="inf__block">
        <h2 className="inf__h">
          참석 <span className="inf__count tnum">{summary.presentCount}/{summary.total}</span>
        </h2>
        {roster.length === 0 ? (
          <p className="inf__none">
            명부가 비어 있어요.{' '}
            <Link to="/people" className="inf__inline">
              <UserPlus size={14} aria-hidden="true" />
              명부 만들기
            </Link>
          </p>
        ) : (
          <ul className="inf__people">
            {roster.map((person) => {
              const current = stateOf(person.id)
              return (
                <li key={person.id} className="inf__person">
                  <span className="inf__name">{personLabel(person)}</span>
                  <span className="inf__states" role="group" aria-label={`${person.name} 참석 상태`}>
                    {STATES.map((each) => (
                      <button
                        key={each}
                        type="button"
                        className={`inf__state inf__state--${each}${current === each ? ' inf__state--on' : ''}`}
                        aria-pressed={current === each}
                        onClick={() =>
                          current === each ? removeAttendee(meeting.id, person.id) : setAttendance(meeting.id, person.id, each)
                        }
                      >
                        {ATTENDANCE_LABELS[each]}
                      </button>
                    ))}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <p className="inf__hint">
          누르지 않은 사람은 회의록에 아예 나오지 않아요. 같은 것을 다시 누르면 지워져요.
        </p>
      </section>

      <section className="inf__block">
        <h2 className="inf__h">회의 마치기</h2>
        <p className="inf__hint">
          {meeting.closedAt
            ? '폐회 시각이 기록돼 있어요. 다시 누르면 지금 시각으로 바뀌어요.'
            : '폐회를 누르면 회의록에 폐회 시각과 걸린 시간이 들어가요.'}
        </p>
        <div className="inf__row">
          <button type="button" className="btn btn--accent" onClick={() => closeMeeting(meeting.id)}>
            폐회 기록
          </button>
          <Link to={`/m/${meeting.id}/doc`} className="btn btn--plain">
            회의록 보기
          </Link>
        </div>
      </section>

      <section className="inf__block inf__block--danger">
        <h2 className="inf__h">이 회의 지우기</h2>
        <p className="inf__hint">적은 줄과 안건이 함께 사라져요. 되돌릴 수 없어요.</p>
        <button
          type="button"
          className="inf__danger"
          onClick={() => {
            if (window.confirm(`'${meeting.title}' 을 지울까요? 적은 것이 모두 사라져요.`)) {
              removeMeeting(meeting.id)
              navigate('/')
            }
          }}
        >
          <Trash2 size={16} aria-hidden="true" />
          회의 지우기
        </button>
      </section>
    </main>
  )
}
