// 지금 말하는 사람. 한 번 누르면 다음 줄까지 유지된다 — 같은 사람이 이어 말하는 일이 많다.
//
// 참석자로 올라간 사람을 **먼저** 보여 준다. 10명 회의에서 명부 전체(수십 명)를 훑게 만들면
// 회의 중에 못 쓴다. 참석자가 아직 없으면 명부에서 고를 수 있게 열어 둔다.
import { useMemo } from 'react'
import type { Meeting, Person } from '../../domain/types'

interface SpeakerBarProps {
  meeting: Meeting
  people: Readonly<Record<string, Person>>
  currentId: string | null
  onPick: (id: string) => void
}

export function SpeakerBar({ meeting, people, currentId, onPick }: SpeakerBarProps) {
  const roster = useMemo(() => {
    const here = meeting.attendees
      .filter((row) => row.attendance !== 'absent')
      .map((row) => people[row.personId])
      .filter((row): row is Person => row !== undefined)
    if (here.length > 0) return here
    return Object.values(people).filter((row) => !row.hidden)
  }, [meeting.attendees, people])

  if (roster.length === 0) return null

  return (
    <div className="spk" role="group" aria-label="말한 사람">
      {roster.map((person) => (
        <button
          key={person.id}
          type="button"
          className={`spk__item${currentId === person.id ? ' spk__item--on' : ''}`}
          aria-pressed={currentId === person.id}
          onClick={() => onPick(person.id)}
        >
          {person.name}
        </button>
      ))}
    </div>
  )
}
