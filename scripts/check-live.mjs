// 배포된 주소를 아이폰 14 Pro 크기로 열어 핵심 흐름을 실제로 눌러 본다.
// 로컬 빌드가 아니라 **배포본**을 본다 — 서비스 워커·하위 경로 문제는 거기서만 난다.
//
// 실행: node scripts/check-live.mjs
import { devices, chromium } from '@playwright/test'

const BASE = process.env.GONOTE_URL ?? 'https://kyeongseok-go.github.io/gonote/'
const say = (line) => process.stdout.write(`${line}\n`)

const browser = await chromium.launch()
const context = await browser.newContext({ ...devices['iPhone 14 Pro'], locale: 'ko-KR' })
const page = await context.newPage()

const errors = []
const failed = []
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('requestfailed', (request) => failed.push(`${request.url()} — ${request.failure()?.errorText ?? ''}`))

try {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  say(`열림: ${await page.title()}`)

  // 회의 시작 → 받아 적기
  await page.getByRole('button', { name: '회의 시작' }).click()
  await page.waitForSelector('.cap__dock')
  say('회의 시작: 받아적기 화면 뜸')

  const write = async (kind, text) => {
    await page.getByRole('group', { name: '줄 종류' }).getByRole('button', { name: kind }).click()
    await page.getByRole('textbox', { name: `${kind} 내용` }).fill(text)
    await page.getByRole('button', { name: '넣기' }).click()
  }

  // 안건 하나 만들고 그 아래로 적는다
  await page.getByRole('button', { name: /^안건$/ }).click()
  await page.getByRole('textbox', { name: '새 안건 이름' }).fill('성탄절 준비')
  await page.getByRole('textbox', { name: '새 안건 이름' }).press('Enter')

  await write('보고', '작년 성탄절 참석 120명으로 보고되었습니다')
  await write('발언', '올해는 주차가 문제가 될 것 같습니다')
  await write('결정', '성탄절 예산 50만원으로 하기로 가결하다')
  await write('할 일', '현수막 주문')
  await write('메모', '이 줄은 회의록에 나오면 안 된다')
  say(`적은 줄: ${await page.locator('.row').count()}개`)

  // 녹음 기준 맞추기
  await page.getByRole('button', { name: /폰으로 녹음 시작했어요/ }).click()
  await page.waitForSelector('.cap__recbtn--on')
  say('녹음 기준: 맞춰짐')

  // 회의록
  await page.getByRole('link', { name: /회의록/ }).click()
  await page.waitForSelector('.paper')
  const decisions = await page.locator('.paper__decisions li').count()
  const actions = await page.locator('.paper__actions tbody tr').count()
  const memoLeaked = (await page.getByText('이 줄은 회의록에 나오면 안 된다').count()) > 0
  say(`회의록: 결정 ${decisions}건 · 할 일 ${actions}건 · 메모 유출 ${memoLeaked ? '있음(문제)' : '없음'}`)

  const share = (await page.locator('.min__pre').textContent()) ?? ''
  say(`카톡 글: ${share.split('\n').length}줄, 결정 번호 ${share.includes('1. ') ? '붙음' : '없음'}`)
  say('--- 카톡에 붙는 글 ---')
  for (const line of share.split('\n')) say(`| ${line}`)
  say('---------------------')

  // 중단 복원: 앱을 완전히 닫았다 여는 것과 같다(설치한 PWA 의 start_url 은 './')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const row = page.getByRole('link', { name: /결정 1건/ })
  await row.waitFor({ state: 'visible', timeout: 15_000 })
  say('중단 복원: 목록에 회의가 남아 있음')

  // 인쇄 레이아웃이 실제로 A4 로 떨어지는지 — 인쇄용 미디어로 바꿔 높이를 잰다
  await row.click()
  await page.getByRole('link', { name: /회의록/ }).click()
  await page.waitForSelector('.paper')
  await page.emulateMedia({ media: 'print' })
  const printed = await page.evaluate(() => {
    const paper = document.querySelector('.paper')
    const hidden = ['.min__bar', '.min__tools', '.min__preview'].every(
      (sel) => !document.querySelector(sel) || getComputedStyle(document.querySelector(sel)).display === 'none',
    )
    return { height: Math.round(paper?.getBoundingClientRect().height ?? 0), hidden }
  })
  // A4 인쇄 영역은 약 1050px(297mm − 여백 36mm, 96dpi 환산). 넘으면 두 장이 된다.
  say(`인쇄: 문서 높이 ${printed.height}px (A4 한 장 ≈ 1050px) · 화면 껍데기 숨김 ${printed.hidden ? '됨' : '안 됨'}`)
  await page.emulateMedia({ media: 'screen' })

  // 오프라인 재방문 — 미리 받기가 끝난 뒤에 끊는다
  await page.evaluate(async () => {
    await navigator.serviceWorker?.ready
  })
  const cached = await page.evaluate(async () => {
    const names = await caches.keys()
    let total = 0
    for (const name of names) total += (await (await caches.open(name)).keys()).length
    return total
  })
  say(`미리 받기: ${cached}항목`)

  await context.setOffline(true)
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '회의 시작' }).waitFor({ state: 'visible', timeout: 20_000 })
  say('오프라인 재방문: 열림')
  await context.setOffline(false)

  // 가로 넘침
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  say(`가로 넘침: ${Math.max(0, overflow)}px`)
  say(`콘솔 오류 ${errors.length}건, 받지 못한 요청 ${failed.length}건`)
  for (const line of [...errors, ...failed].slice(0, 5)) say(`  ${line}`)

  const bad = memoLeaked || overflow > 0 || errors.length > 0 || decisions !== 1
  say(bad ? '\n배포본 점검 실패: 위 줄을 확인해 주세요' : '\n배포본 점검 통과: 받아적기·회의록·공유·오프라인 전부 동작')
  if (bad) process.exitCode = 1
} finally {
  await browser.close()
}
