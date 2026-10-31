import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MinutesScreen } from './MinutesScreen'
import { resetApp } from '../../test/reset'
import { useApp } from '../../store/app'

function show(meetingId: string) {
  return render(
    <MemoryRouter initialEntries={[`/m/${meetingId}/doc`]}>
      <Routes>
        <Route path="/m/:id/doc" element={<MinutesScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

/** 결정·할 일·발언이 하나씩 있는 회의를 만든다. */
async function meetingWithContent() {
  const store = useApp.getState()
  const person = store.addPerson('김영수', '장로')!
  const meeting = store.createMeeting({ title: '11월 제직회' })
  store.updateMeeting(meeting.id, { place: '본당 2층', scribe: '고경석' })
  store.setAttendance(meeting.id, person.id, 'present')
  const agenda = store.addAgenda(meeting.id, '성탄절 준비')!
  store.addEntry({ meetingId: meeting.id, kind: 'speech', text: '인원이 늘 것 같습니다', agendaId: agenda.id, speakerId: person.id })
  const decision = store.addEntry({ meetingId: meeting.id, kind: 'decision', text: '예산 50만원으로 하기로 가결하다', agendaId: agenda.id })!
  store.updateEntry(decision.id, { result: 'unanimous' })
  store.addEntry({ meetingId: meeting.id, kind: 'action', text: '현수막 주문', agendaId: agenda.id })
  store.addEntry({ meetingId: meeting.id, kind: 'memo', text: '나만 보는 메모', agendaId: agenda.id })
  await useApp.getState().settled()
  return meeting
}

beforeEach(async () => {
  await resetApp()
})

describe('MinutesScreen', () => {
  test('회의를 찾지 못하면 돌아가는 길을 준다', () => {
    render(
      <MemoryRouter initialEntries={['/m/없음/doc']}>
        <Routes>
          <Route path="/m/:id/doc" element={<MinutesScreen />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('회의를 찾지 못했어요')).toBeInTheDocument()
  })

  test('회의록 머리에 일시·장소·성원·서기가 들어간다', async () => {
    const meeting = await meetingWithContent()
    show(meeting.id)

    expect(screen.getByText('본당 2층')).toBeInTheDocument()
    expect(screen.getByText('재적 1명 중 1명 참석')).toBeInTheDocument()
    expect(screen.getByText('고경석')).toBeInTheDocument()
  })

  test('결정과 할 일이 따로 모인다', async () => {
    const meeting = await meetingWithContent()
    show(meeting.id)

    expect(screen.getByRole('heading', { name: '결정 사항' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '할 일' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '현수막 주문' })).toBeInTheDocument()
  })

  test('표결 결과가 결정에 붙는다', async () => {
    const meeting = await meetingWithContent()
    show(meeting.id)

    expect(screen.getAllByText('만장일치 가결').length).toBeGreaterThan(0)
  })

  test('메모는 회의록에 나오지 않는다', async () => {
    const meeting = await meetingWithContent()
    show(meeting.id)

    expect(screen.queryByText('나만 보는 메모')).not.toBeInTheDocument()
  })

  test('결정이 없으면 없다고 적는다 — 빈 칸은 빠뜨린 것처럼 보인다', async () => {
    const meeting = useApp.getState().createMeeting()
    await useApp.getState().settled()
    show(meeting.id)

    expect(screen.getByText('결정된 사항 없음')).toBeInTheDocument()
  })

  test('카톡에 붙는 모양을 미리 보여 준다', async () => {
    const meeting = await meetingWithContent()
    show(meeting.id)

    expect(screen.getByText('카톡에 붙는 모양')).toBeInTheDocument()
    expect(screen.getByText(/■ 결정 사항/)).toBeInTheDocument()
  })

  test('복사를 누르면 클립보드에 들어간다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    const meeting = await meetingWithContent()
    show(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: /결정·할 일만 복사/ }))

    await waitFor(() => expect(writeText).toHaveBeenCalled())
    expect(writeText.mock.calls[0][0]).toContain('예산 50만원으로 하기로 가결하다')
    expect(screen.getByRole('status')).toHaveTextContent('복사했어요')
  })

  test('클립보드가 막혀 있으면 직접 복사하라고 알린다', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('막힘')) } })
    const meeting = await meetingWithContent()
    show(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: /전체 복사/ }))

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('길게 눌러'))
  })

  test('공유를 누르면 기기의 공유창을 연다', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { share })
    const meeting = await meetingWithContent()
    show(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: /회의록 공유/ }))

    await waitFor(() => expect(share).toHaveBeenCalled())
  })

  test('공유창이 없는 기기에서는 복사로 떨어진다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText }, share: undefined })
    const meeting = await meetingWithContent()
    show(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: /회의록 공유/ }))

    await waitFor(() => expect(writeText).toHaveBeenCalled())
  })

  test('인쇄를 누르면 브라우저 인쇄가 열린다 — 이것이 PDF 를 만드는 길이다', async () => {
    const print = vi.fn()
    Object.assign(window, { print })
    const meeting = await meetingWithContent()
    show(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: /인쇄 · PDF/ }))

    expect(print).toHaveBeenCalled()
  })
})
