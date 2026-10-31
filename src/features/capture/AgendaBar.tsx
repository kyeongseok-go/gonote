// 지금 어느 안건을 다루고 있나. 여기서 고른 안건에 그 뒤로 적는 줄이 붙는다.
//
// 리서치에서 공통으로 나온 것: **회의 전에 안건을 적어 두면 그것이 회의록의 뼈대가 된다**
// (조사한 14개 중 7개, research/refs-products.md). 그래서 안건을 여기서 바로 만들 수 있게 뒀다 —
// 설정 화면으로 보내면 회의 중에는 아무도 만들지 않는다.
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../store/app'
import type { Agenda } from '../../domain/types'

interface AgendaBarProps {
  meetingId: string
  agendas: readonly Agenda[]
  currentId: string | null
  onPick: (id: string | null) => void
}

export function AgendaBar({ meetingId, agendas, currentId, onPick }: AgendaBarProps) {
  const addAgenda = useApp((s) => s.addAgenda)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')

  const submit = () => {
    const made = addAgenda(meetingId, title)
    if (made) onPick(made.id)
    setTitle('')
    setAdding(false)
  }

  return (
    <div className="agb">
      <div className="agb__scroll" role="group" aria-label="지금 안건">
        {agendas.map((agenda, index) => (
          <button
            key={agenda.id}
            type="button"
            className={`agb__item${currentId === agenda.id ? ' agb__item--on' : ''}`}
            aria-pressed={currentId === agenda.id}
            onClick={() => onPick(agenda.id)}
          >
            <span className="agb__no tnum">{index + 1}</span>
            {agenda.title}
          </button>
        ))}

        {adding ? (
          <form
            className="agb__form"
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
          >
            {/* biome-ignore lint: 자동 포커스가 맞다 — 누르자마자 치기 시작해야 한다 */}
            <input
              className="agb__input"
              value={title}
              autoFocus
              placeholder="안건 이름"
              aria-label="새 안건 이름"
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => (title.trim() ? submit() : setAdding(false))}
            />
          </form>
        ) : (
          <button type="button" className="agb__add" onClick={() => setAdding(true)}>
            <Plus size={16} aria-hidden="true" />
            안건
          </button>
        )}
      </div>
    </div>
  )
}
