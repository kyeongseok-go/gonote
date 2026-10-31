// 회의 틀. **회의 전에 안건을 적어 두면 그것이 회의록의 뼈대가 된다** —
// 조사한 제품 14개 중 7개가 공통으로 그렇게 한다(research/refs-products.md).
//
// 교회 회의의 안건 순서는 교단 규정이 정해 둔 3단 구조를 따른다:
// **개회(예배) → 회무 처리(회원 점명·개회 선언·안건) → 폐회**
// (예장통합 「총회 회의록 작성법 및 보존법」, 고신총회 「회의록 작성법」 — research/refs-church.md)
//
// 틀은 **안건 이름만** 만들어 준다. 내용을 미리 채우지 않는다 —
// 적지 않은 것이 회의록에 적혀 있는 것이 이 앱에서 가장 위험한 고장이다.

export interface MeetingTemplate {
  id: string
  name: string
  /** 회의 종류. 회의록 머리에 적힌다 */
  kind: string
  /** 무엇에 쓰는 틀인지 한 줄 */
  hint: string
  /** 미리 만들어 둘 안건 이름. 순서 그대로 들어간다 */
  agendas: readonly string[]
}

export const TEMPLATES: readonly MeetingTemplate[] = [
  {
    id: 'plain',
    name: '빈 회의',
    kind: '',
    hint: '안건 없이 바로 적기 시작해요',
    agendas: [],
  },
  {
    id: 'board',
    name: '제직회·당회',
    kind: '제직회',
    hint: '개회 → 보고 → 안건 → 폐회. 교단 규정의 3단 구조예요',
    agendas: ['개회 (기도·찬송)', '지난 회의록 확인', '보고 사항', '안건', '기타 논의', '폐회 (기도)'],
  },
  {
    id: 'dept',
    name: '부서 회의',
    kind: '부서 회의',
    hint: '보고와 할 일 나누기가 중심인 회의',
    agendas: ['지난 할 일 확인', '보고 사항', '이번 안건', '할 일 나누기', '다음 회의'],
  },
  {
    id: 'event',
    name: '행사 준비',
    kind: '준비 회의',
    hint: '행사 하나를 준비하는 회의',
    agendas: ['일정 확인', '예산', '맡을 일 나누기', '준비물', '남은 걱정'],
  },
]

export function templateOf(id: string): MeetingTemplate | undefined {
  return TEMPLATES.find((row) => row.id === id)
}
