// 첫 화면. **한 번 눌러 회의가 시작돼야 한다.**
//
// 회의는 늘 급하게 시작된다. 제목·장소·참석자를 먼저 묻는 화면을 두면 그걸 채우는 동안
// 회의가 시작되고, 앞부분을 놓친다. 그래서 바로 만들고 **나중에 고치게** 한다.
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, Settings, Users } from 'lucide-react'
import { useApp } from '../../store/app'
import { buildMinutes } from '../../domain/minutes'
import { koreanDayShort } from '../../domain/time'
import './meetings.css'

export function MeetingList() {
  const navigate = useNavigate()
  const ready = useApp((s) => s.ready)
  const entities = useApp((s) => s.entities)
  const createMeeting = useApp((s) => s.createMeeting)

  const meetings = Object.values(entities.meetings).sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  )

  const start = () => {
    const meeting = createMeeting()
    navigate(`/m/${meeting.id}`)
  }

  return (
    <main className="mts">
      <header className="mts__top">
        <div>
          <h1 className="mts__title">회의록</h1>
          <p className="mts__sub">적으면 그대로 회의록이 돼요</p>
        </div>
        <nav className="mts__nav">
          <Link to="/people" className="mts__icon" aria-label="명부">
            <Users size={20} aria-hidden="true" />
          </Link>
          <Link to="/settings" className="mts__icon" aria-label="설정">
            <Settings size={20} aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <button type="button" className="mts__start" onClick={start}>
        <Plus size={22} aria-hidden="true" />
        회의 시작
      </button>

      {!ready ? (
        <p className="mts__wait">읽는 중이에요…</p>
      ) : meetings.length === 0 ? (
        <section className="mts__empty">
          <p className="mts__empty-title">아직 회의가 없어요</p>
          <p>
            위 <strong>회의 시작</strong>을 누르면 바로 적을 수 있어요. 이름·장소·참석자는 회의 중에 고쳐도
            돼요.
          </p>
        </section>
      ) : (
        <ul className="mts__list">
          {meetings.map((meeting) => {
            const doc = buildMinutes({
              meeting,
              people: entities.people,
              agendas: entities.agendas,
              entries: entities.entries,
            })
            const open = meeting.closedAt === null
            return (
              <li key={meeting.id}>
                <Link to={`/m/${meeting.id}`} className="mts__row">
                  <span className="mts__rowmain">
                    <span className="mts__rowtitle">
                      {meeting.title}
                      {open ? <span className="mts__open">진행 중</span> : null}
                    </span>
                    <span className="mts__rowmeta">
                      {koreanDayShort(meeting.date)}
                      {doc.attendance.total > 0 ? ` · 참석 ${doc.attendance.presentCount}명` : ''}
                      {doc.decisions.length > 0 ? ` · 결정 ${doc.decisions.length}건` : ''}
                      {doc.actions.length > 0 ? ` · 할 일 ${doc.actions.length}건` : ''}
                    </span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" className="mts__chev" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
