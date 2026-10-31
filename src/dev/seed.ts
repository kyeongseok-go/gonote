// 스크린샷·수동 점검용 샘플 회의. **없으면 빈 화면만 찍힌다.**
//
// 내용은 교회 회의에서 실제로 나올 만한 것으로 뒀다 — 빈 칸에 'lorem ipsum' 을 넣으면
// 글자 길이가 현실과 달라서 레이아웃 문제를 못 찾는다.
import { useApp } from '../store/app'

export interface SeedOptions {
  /** 회의를 끝낸 상태로 둘까(폐회 시각·걸린 시간이 생긴다) */
  closed?: boolean
  /** 녹음 기준 시각을 맞춰 둘까(줄마다 경과 시간이 붙는다) */
  recording?: boolean
}

const PEOPLE: readonly [string, string][] = [
  ['김영수', '장로'],
  ['박미경', '권사'],
  ['이준호', '집사'],
  ['최은영', '권사'],
  ['정대현', '집사'],
  ['한소라', '집사'],
  ['오민석', '목사'],
]

export async function seedDemo(options: SeedOptions = {}): Promise<string> {
  const store = useApp.getState()
  await store.load()

  const people = PEOPLE.map(([name, role]) => store.addPerson(name, role)).filter((row) => row !== null)
  const meeting = store.createMeeting({
    title: '11월 제직회',
    templateId: 'board',
    attendeeIds: people.slice(0, 6).map((row) => row.id),
  })
  store.updateMeeting(meeting.id, {
    place: '본당 2층 회의실',
    scribe: '고경석',
    nextMeetingNote: '12월 6일 (토) 오전 10시, 같은 장소',
  })
  // 한 사람은 불참, 한 사람은 지참으로 둬서 세 가지 상태가 다 보이게 한다.
  store.setAttendance(meeting.id, people[6].id, 'absent')
  store.setAttendance(meeting.id, people[5].id, 'late')
  // 회의는 보통 아침에 연다. 개회를 비워 두면 회의록 머리가 비현실적으로 보인다.
  const opened = new Date()
  opened.setHours(10, 0, 0, 0)
  store.updateMeeting(meeting.id, { openedAt: opened.toISOString() })
  if (options.recording) store.markRecordingStart(meeting.id)

  const agendas = Object.values(useApp.getState().entities.agendas)
    .filter((row) => row.meetingId === meeting.id)
    .sort((a, b) => a.order - b.order)
  const at = (index: number) => agendas[index]?.id ?? null

  const add = (kind: Parameters<typeof store.addEntry>[0]['kind'], text: string, agendaId: string | null, speakerId?: string) =>
    useApp.getState().addEntry({ meetingId: meeting.id, kind, text, agendaId, speakerId: speakerId ?? null })

  add('report', '오민석 목사님 기도로 시작했습니다', at(0))
  add('report', '지난 10월 회의록을 확인하고 그대로 받기로 했습니다', at(1))
  add('report', '10월 헌금 집행 내역을 보고했습니다', at(2), people[1].id)
  add('speech', '작년 성탄절은 참석이 120명이었는데 올해는 더 늘 것 같습니다', at(3), people[0].id)
  add('speech', '주차가 가장 걱정됩니다. 작년에도 길에 세우는 분들이 많았어요', at(3), people[2].id)
  add('speech', '교회 앞 상가와 미리 이야기해 두면 어떨까요', at(3), people[3].id)
  const decision = add('decision', '성탄절 행사 예산을 50만원으로 하기로 가결하다', at(3))
  add('action', '현수막 주문 @김영수', at(3))
  add('action', '주차 안내 당번 편성 @이준호', at(3))
  add('speech', '성가대 연습 시간을 한 주 늘리고 싶습니다', at(4), people[4].id)
  add('decision', '성가대 연습을 12월부터 주 2회로 하기로 가결하다', at(4))
  add('memo', '예산은 다음 회의에서 다시 확인 필요 (나만 보는 메모)', at(4))
  add('report', '오민석 목사님 기도로 마쳤습니다', at(5))

  if (decision) {
    useApp.getState().updateEntry(decision.id, { result: 'unanimous', vote: { for: 6, against: 0, abstain: 0 } })
  }

  const actions = Object.values(useApp.getState().entities.entries)
    .filter((row) => row.meetingId === meeting.id && row.kind === 'action')
    .sort((a, b) => a.order - b.order)
  if (actions[0]) useApp.getState().updateEntry(actions[0].id, { due: '2026-11-15' })
  if (actions[1]) useApp.getState().updateEntry(actions[1].id, { due: '2026-12-20' })

  if (options.closed) {
    const closed = new Date(opened.getTime() + 85 * 60_000)
    useApp.getState().updateMeeting(meeting.id, { closedAt: closed.toISOString() })
  }
  await useApp.getState().settled()
  return meeting.id
}
