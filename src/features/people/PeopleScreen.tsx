// 명부. 교회 회의는 **같은 사람들이 매달 모인다** — 매번 10명을 치게 만들면 두 번째 회의부터 안 쓴다.
//
// 지우지 않고 숨긴다. 지난 회의록의 발언자가 사라지면 그 회의록이 "누가 말했는지 모르는 문서" 가 된다.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, EyeOff, Plus, Undo2 } from 'lucide-react'
import { useApp } from '../../store/app'
import './people.css'

/** 교회에서 흔한 직분. 치는 것보다 누르는 것이 빠르다. */
const ROLES = ['목사', '장로', '권사', '집사', '전도사', '성도'] as const

export function PeopleScreen() {
  const entities = useApp((s) => s.entities)
  const addPerson = useApp((s) => s.addPerson)
  const updatePerson = useApp((s) => s.updatePerson)
  const hidePerson = useApp((s) => s.hidePerson)

  const [name, setName] = useState('')
  const [role, setRole] = useState('')

  const people = Object.values(entities.people)
  const shown = people.filter((row) => !row.hidden)
  const hidden = people.filter((row) => row.hidden)

  const submit = () => {
    if (addPerson(name, role)) setName('')
  }

  return (
    <main className="ppl">
      <header className="ppl__top">
        <Link to="/" className="ppl__back" aria-label="회의 목록으로">
          <ChevronLeft size={22} aria-hidden="true" />
        </Link>
        <h1>명부</h1>
      </header>

      <p className="ppl__why">
        한 번 넣어 두면 회의마다 이름을 다시 치지 않아요. 발언자와 담당자를 누르기만 하면 돼요.
      </p>

      <form
        className="ppl__add"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="ppl__roles" role="group" aria-label="직분">
          {ROLES.map((each) => (
            <button
              key={each}
              type="button"
              className={`chip${role === each ? ' chip--on' : ''}`}
              aria-pressed={role === each}
              onClick={() => setRole(role === each ? '' : each)}
            >
              {each}
            </button>
          ))}
        </div>
        <div className="ppl__line">
          <input
            className="ppl__input"
            value={name}
            placeholder="이름"
            aria-label="이름"
            onChange={(event) => setName(event.target.value)}
          />
          <button type="submit" className="ppl__plus" disabled={name.trim().length === 0}>
            <Plus size={20} aria-hidden="true" />
            넣기
          </button>
        </div>
      </form>

      {shown.length === 0 ? (
        <p className="ppl__none">아직 명부가 비어 있어요.</p>
      ) : (
        <ul className="ppl__list">
          {shown.map((person) => (
            <li key={person.id} className="ppl__row">
              <input
                className="ppl__name"
                value={person.name}
                aria-label={`${person.name} 이름`}
                onChange={(event) => updatePerson(person.id, { name: event.target.value })}
              />
              <input
                className="ppl__role"
                value={person.role}
                placeholder="직분"
                aria-label={`${person.name} 직분`}
                onChange={(event) => updatePerson(person.id, { role: event.target.value })}
              />
              <button
                type="button"
                className="ppl__hide"
                aria-label={`${person.name} 숨기기`}
                onClick={() => hidePerson(person.id, true)}
              >
                <EyeOff size={17} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {hidden.length > 0 ? (
        <section className="ppl__hidden">
          <h2>숨긴 사람 {hidden.length}명</h2>
          <p>지난 회의록에는 그대로 남아 있어요.</p>
          <ul>
            {hidden.map((person) => (
              <li key={person.id}>
                <span>{person.name}</span>
                <button type="button" className="ppl__undo" onClick={() => hidePerson(person.id, false)}>
                  <Undo2 size={15} aria-hidden="true" />
                  다시 쓰기
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
