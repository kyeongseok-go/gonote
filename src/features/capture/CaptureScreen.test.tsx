import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CaptureScreen } from './CaptureScreen'
import { resetApp } from '../../test/reset'
import { useApp } from '../../store/app'

function show(meetingId: string) {
  return render(
    <MemoryRouter initialEntries={[`/m/${meetingId}`]}>
      <Routes>
        <Route path="/m/:id" element={<CaptureScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function withMeeting() {
  const meeting = useApp.getState().createMeeting({ title: '11월 제직회' })
  await useApp.getState().settled()
  return meeting
}

/** 종류를 고르고 한 줄 적는다. 회의 중에 가장 많이 하는 동작이다. */
async function write(kind: string, text: string) {
  await userEvent.click(within(screen.getByRole('group', { name: '줄 종류' })).getByRole('button', { name: kind }))
  await userEvent.type(screen.getByRole('textbox', { name: `${kind} 내용` }), text)
  await userEvent.click(screen.getByRole('button', { name: '넣기' }))
}

beforeEach(async () => {
  await resetApp()
})

describe('CaptureScreen', () => {
  test('회의를 찾지 못하면 돌아가는 길을 준다', () => {
    render(
      <MemoryRouter initialEntries={['/m/없는회의']}>
        <Routes>
          <Route path="/m/:id" element={<CaptureScreen />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('회의를 찾지 못했어요')).toBeInTheDocument()
  })

  test('화면에 들어오는 순간이 개회다 — 따로 누르게 하면 아무도 누르지 않는다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)

    await waitFor(() => {
      expect(useApp.getState().entities.meetings[meeting.id].openedAt).not.toBeNull()
    })
  })

  test('적은 줄이 화면에 남는다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)

    await write('발언', '작년보다 인원이 늘 것 같습니다')

    expect(screen.getByText('작년보다 인원이 늘 것 같습니다')).toBeInTheDocument()
  })

  test('넣고 나면 입력칸이 비어 다음 줄을 바로 적을 수 있다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)

    await write('결정', '그렇게 하기로 가결하다')

    expect(screen.getByRole('textbox', { name: '결정 내용' })).toHaveValue('')
  })

  test('고른 종류가 다음 줄까지 유지된다 — 발언을 연달아 적는 게 보통이다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)

    await write('보고', '10월 헌금 보고')
    await userEvent.type(screen.getByRole('textbox', { name: '보고 내용' }), '11월 예산 보고')
    await userEvent.click(screen.getByRole('button', { name: '넣기' }))

    const entries = Object.values(useApp.getState().entities.entries)
    expect(entries.every((row) => row.kind === 'report')).toBe(true)
  })

  test('빈 칸이면 넣기를 누를 수 없다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)

    expect(screen.getByRole('button', { name: '넣기' })).toBeDisabled()
  })

  test('엔터로 넣는다 — 데스크톱에서 손을 떼지 않게', async () => {
    const meeting = await withMeeting()
    show(meeting.id)

    await userEvent.type(screen.getByRole('textbox', { name: '발언 내용' }), '엔터로 넣은 줄{Enter}')

    expect(screen.getByText('엔터로 넣은 줄')).toBeInTheDocument()
  })

  test('안건을 만들면 그 뒤 줄이 그 안건에 붙는다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: '안건', exact: true }))
    await userEvent.type(screen.getByRole('textbox', { name: '새 안건 이름' }), '성탄절 준비{Enter}')
    await write('발언', '현수막부터 정하죠')

    const agenda = Object.values(useApp.getState().entities.agendas)[0]
    const entry = Object.values(useApp.getState().entities.entries)[0]
    expect(agenda.title).toBe('성탄절 준비')
    expect(entry.agendaId).toBe(agenda.id)
  })

  test('회의 틀은 아직 아무것도 없을 때만 권한다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)
    expect(screen.getByRole('region', { name: '회의 틀' })).toBeInTheDocument()

    await write('메모', '한 줄 적었다')

    expect(screen.queryByRole('region', { name: '회의 틀' })).not.toBeInTheDocument()
  })

  test('틀을 고르면 안건이 깔린다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: /제직회·당회/ }))

    await waitFor(() => {
      const agendas = Object.values(useApp.getState().entities.agendas)
      expect(agendas.length).toBeGreaterThan(3)
    })
  })

  test('말한 사람을 고르면 줄에 붙는다', async () => {
    const person = useApp.getState().addPerson('김영수', '장로')!
    const meeting = useApp.getState().createMeeting()
    useApp.getState().setAttendance(meeting.id, person.id, 'present')
    await useApp.getState().settled()
    show(meeting.id)

    await userEvent.click(within(screen.getByRole('group', { name: '말한 사람' })).getByRole('button', { name: '김영수' }))
    await write('발언', '제가 말했습니다')

    expect(screen.getByText('김영수 장로')).toBeInTheDocument()
  })

  test('녹음 기준을 맞추면 줄에 경과 시간이 붙는다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)

    await userEvent.click(screen.getByRole('button', { name: /폰으로 녹음 시작했어요/ }))
    await write('발언', '녹음 뒤에 적은 줄')

    expect(screen.getByRole('button', { name: /녹음 기준 맞춰져 있어요/ })).toBeInTheDocument()
    expect(screen.getByText('0:00')).toBeInTheDocument()
  })

  test('줄을 눌러 종류를 바꿀 수 있다 — 발언이라 적었는데 결정이었던 경우', async () => {
    const meeting = await withMeeting()
    show(meeting.id)
    await write('발언', '그렇게 하죠')

    await userEvent.click(screen.getByRole('button', { expanded: false, name: /그렇게 하죠/ }))
    await userEvent.click(
      within(screen.getByRole('group', { name: '줄 종류 바꾸기' })).getByRole('button', { name: '결정' }),
    )

    expect(Object.values(useApp.getState().entities.entries)[0].kind).toBe('decision')
  })

  test('줄을 지울 수 있다 — 물어보고 지운다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)
    await write('메모', '지울 줄')
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    await userEvent.click(screen.getByRole('button', { expanded: false, name: /지울 줄/ }))
    await userEvent.click(screen.getByRole('button', { name: /줄 지우기/ }))

    expect(Object.keys(useApp.getState().entities.entries)).toHaveLength(0)
  })

  test('할 일에 담당과 기한을 붙일 수 있다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)
    await write('할 일', '현수막 주문')

    await userEvent.click(screen.getByRole('button', { expanded: false, name: /현수막 주문/ }))
    await userEvent.type(screen.getByRole('textbox', { name: '담당' }), '김영수')
    await userEvent.click(screen.getByRole('button', { name: '아직 안 했어요' }))

    const entry = Object.values(useApp.getState().entities.entries)[0]
    expect(entry.assigneeText).toBe('김영수')
    expect(entry.done).toBe(true)
  })

  test('결정에 표결 결과를 붙일 수 있다', async () => {
    const meeting = await withMeeting()
    show(meeting.id)
    await write('결정', '예산 50만원으로 하기로 가결하다')

    await userEvent.click(screen.getByRole('button', { expanded: false, name: /예산 50만원/ }))
    await userEvent.click(
      within(screen.getByRole('group', { name: '표결 결과' })).getByRole('button', { name: '만장일치 가결' }),
    )

    expect(Object.values(useApp.getState().entities.entries)[0].result).toBe('unanimous')
  })
})
