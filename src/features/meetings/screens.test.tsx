import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MeetingList } from './MeetingList'
import { MeetingInfo } from './MeetingInfo'
import { PeopleScreen } from '../people/PeopleScreen'
import { SettingsScreen } from '../settings/SettingsScreen'
import { resetApp } from '../../test/reset'
import { useApp } from '../../store/app'

const navigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

beforeEach(async () => {
  navigate.mockClear()
  await resetApp()
})

function showList() {
  return render(
    <MemoryRouter>
      <MeetingList />
    </MemoryRouter>,
  )
}

function showInfo(meetingId: string) {
  return render(
    <MemoryRouter initialEntries={[`/m/${meetingId}/info`]}>
      <Routes>
        <Route path="/m/:id/info" element={<MeetingInfo />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MeetingList', () => {
  test('비어 있으면 무엇을 눌러야 하는지 알려 준다', () => {
    showList()

    expect(screen.getByText('아직 회의가 없어요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /회의 시작/ })).toBeInTheDocument()
  })

  test('회의 시작을 누르면 만들고 바로 받아적기로 간다', async () => {
    showList()

    await userEvent.click(screen.getByRole('button', { name: /회의 시작/ }))

    const meeting = Object.values(useApp.getState().entities.meetings)[0]
    expect(meeting).toBeDefined()
    expect(navigate).toHaveBeenCalledWith(`/m/${meeting.id}`)
  })

  test('회의마다 결정·할 일 수가 보인다 — 어느 회의였는지 알아보는 단서다', async () => {
    const store = useApp.getState()
    const meeting = store.createMeeting({ title: '11월 제직회' })
    store.addEntry({ meetingId: meeting.id, kind: 'decision', text: '정했다' })
    store.addEntry({ meetingId: meeting.id, kind: 'action', text: '할 일' })
    await useApp.getState().settled()

    showList()

    expect(screen.getByRole('link', { name: /결정 1건/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /할 일 1건/ })).toBeInTheDocument()
  })

  test('끝내지 않은 회의에 진행 중 표시가 붙는다', async () => {
    useApp.getState().createMeeting({ title: '열린 회의' })
    await useApp.getState().settled()

    showList()

    expect(screen.getByText('진행 중')).toBeInTheDocument()
  })

  test('최근 회의가 위에 온다', async () => {
    const store = useApp.getState()
    const old = store.createMeeting({ title: '지난 회의' })
    store.updateMeeting(old.id, { date: '2026-10-01' })
    store.createMeeting({ title: '이번 회의' })
    await useApp.getState().settled()

    showList()

    // 머리말의 명부·설정 아이콘도 링크다. 회의 목록 안에서만 본다.
    const rows = within(screen.getByRole('list')).getAllByRole('link')
    expect(rows[0]).toHaveTextContent('이번 회의')
  })
})

describe('MeetingInfo', () => {
  test('회의록 머리말을 고칠 수 있다', async () => {
    const meeting = useApp.getState().createMeeting()
    await useApp.getState().settled()
    showInfo(meeting.id)

    await userEvent.type(screen.getByRole('textbox', { name: '장소' }), '본당')

    expect(useApp.getState().entities.meetings[meeting.id].place).toBe('본당')
  })

  test('참석 상태를 세 가지로 고를 수 있다', async () => {
    const person = useApp.getState().addPerson('김영수', '장로')!
    const meeting = useApp.getState().createMeeting()
    await useApp.getState().settled()
    showInfo(meeting.id)

    const row = screen.getByRole('group', { name: /김영수 참석 상태/ })
    await userEvent.click(within(row).getByRole('button', { name: '지참' }))

    expect(useApp.getState().entities.meetings[meeting.id].attendees).toEqual([
      { personId: person.id, attendance: 'late' },
    ])
  })

  test('같은 것을 다시 누르면 참석 기록에서 빠진다', async () => {
    const person = useApp.getState().addPerson('김영수')!
    const meeting = useApp.getState().createMeeting()
    useApp.getState().setAttendance(meeting.id, person.id, 'present')
    await useApp.getState().settled()
    showInfo(meeting.id)

    const row = screen.getByRole('group', { name: /김영수 참석 상태/ })
    await userEvent.click(within(row).getByRole('button', { name: '참석' }))

    expect(useApp.getState().entities.meetings[meeting.id].attendees).toEqual([])
  })

  test('명부가 비어 있으면 명부로 가는 길을 준다', async () => {
    const meeting = useApp.getState().createMeeting()
    await useApp.getState().settled()
    showInfo(meeting.id)

    expect(screen.getByRole('link', { name: /명부 만들기/ })).toBeInTheDocument()
  })

  test('폐회를 누르면 시각이 기록된다', async () => {
    const meeting = useApp.getState().createMeeting()
    await useApp.getState().settled()
    showInfo(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: '폐회 기록' }))

    expect(useApp.getState().entities.meetings[meeting.id].closedAt).not.toBeNull()
  })

  test('회의를 지우면 목록으로 돌아간다 — 물어보고 지운다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const meeting = useApp.getState().createMeeting()
    await useApp.getState().settled()
    showInfo(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: /회의 지우기/ }))

    expect(useApp.getState().entities.meetings[meeting.id]).toBeUndefined()
    expect(navigate).toHaveBeenCalledWith('/')
  })

  test('묻는 말에 아니라고 하면 지우지 않는다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const meeting = useApp.getState().createMeeting()
    await useApp.getState().settled()
    showInfo(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: /회의 지우기/ }))

    expect(useApp.getState().entities.meetings[meeting.id]).toBeDefined()
  })
})

describe('PeopleScreen', () => {
  function showPeople() {
    return render(
      <MemoryRouter>
        <PeopleScreen />
      </MemoryRouter>,
    )
  }

  test('직분을 누르고 이름을 넣으면 명부에 들어간다', async () => {
    showPeople()

    await userEvent.click(screen.getByRole('button', { name: '장로' }))
    await userEvent.type(screen.getByRole('textbox', { name: '이름' }), '김영수')
    await userEvent.click(screen.getByRole('button', { name: /넣기/ }))

    const person = Object.values(useApp.getState().entities.people)[0]
    expect(person.name).toBe('김영수')
    expect(person.role).toBe('장로')
  })

  test('이름이 비면 넣을 수 없다', () => {
    showPeople()

    expect(screen.getByRole('button', { name: /넣기/ })).toBeDisabled()
  })

  test('숨긴 사람은 목록에서 빠지고 다시 쓸 수 있다', async () => {
    const person = useApp.getState().addPerson('김영수', '집사')!
    await useApp.getState().settled()
    showPeople()

    await userEvent.click(screen.getByRole('button', { name: /김영수 숨기기/ }))
    expect(useApp.getState().entities.people[person.id].hidden).toBe(true)
    expect(screen.getByText(/숨긴 사람 1명/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /다시 쓰기/ }))
    expect(useApp.getState().entities.people[person.id].hidden).toBe(false)
  })
})

describe('SettingsScreen', () => {
  function showSettings() {
    return render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
  }

  test('새 회의에 미리 채울 값을 저장한다', async () => {
    showSettings()

    await userEvent.type(screen.getByRole('textbox', { name: '회의 종류' }), '제직회')

    expect(useApp.getState().settings.defaultKind).toBe('제직회')
  })

  test('공유에 발언을 넣을지 끌 수 있다', async () => {
    showSettings()

    await userEvent.click(screen.getByRole('button', { name: /발언 기록까지 넣기/ }))

    expect(useApp.getState().settings.shareIncludesSpeech).toBe(true)
  })

  test('공유할 때 이름을 가릴 수 있다', async () => {
    showSettings()

    await userEvent.click(screen.getByRole('button', { name: /발언자 이름 가리기/ }))

    expect(useApp.getState().settings.shareHidesNames).toBe(true)
  })

  test('테마를 바꿀 수 있다', async () => {
    showSettings()

    await userEvent.click(screen.getByRole('button', { name: '다크' }))

    expect(useApp.getState().settings.theme).toBe('dark')
  })

  test('모두 지우기는 물어본 뒤에 지운다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    useApp.getState().createMeeting()
    await useApp.getState().settled()
    showSettings()

    await userEvent.click(screen.getByRole('button', { name: '전부 지우기' }))

    await waitFor(() => expect(Object.keys(useApp.getState().entities.meetings)).toHaveLength(0))
  })
})
