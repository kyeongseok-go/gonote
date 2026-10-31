import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// 핵심 흐름: 회의 시작 → 받아 적기 → 회의록 → 공유 글.
// 개발 서버가 아니라 `vite preview` 로 띄운 프로덕션 빌드를 돈다(playwright.config.ts).

async function startMeeting(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: '회의 시작' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

/** 종류를 고르고 한 줄 적는다. 회의 중에 가장 많이 하는 동작이다. */
async function write(page: Page, kind: string, text: string) {
  await page.getByRole('group', { name: '줄 종류' }).getByRole('button', { name: kind }).click()
  await page.getByRole('textbox', { name: `${kind} 내용` }).fill(text)
  await page.getByRole('button', { name: '넣기' }).click()
}

test('회의를 시작하면 바로 적을 수 있다', async ({ page }) => {
  await startMeeting(page)

  await expect(page.getByRole('button', { name: '넣기' })).toBeVisible()
  await expect(page.getByText('아직 적은 것이 없어요')).toBeVisible()
})

test('적은 줄이 화면에 남는다', async ({ page }) => {
  await startMeeting(page)

  await write(page, '발언', '작년보다 인원이 늘 것 같습니다')

  await expect(page.getByText('작년보다 인원이 늘 것 같습니다')).toBeVisible()
})

test('넣고 나면 입력칸이 비어 다음 줄을 바로 적을 수 있다', async ({ page }) => {
  await startMeeting(page)

  await write(page, '발언', '첫 줄입니다')

  await expect(page.getByRole('textbox', { name: '발언 내용' })).toHaveValue('')
})

test('빈 줄은 들어가지 않는다 — 회의 중에 두 번 누르는 일이 잦다', async ({ page }) => {
  await startMeeting(page)

  await expect(page.getByRole('button', { name: '넣기' })).toBeDisabled()
})

test('결정과 할 일이 회의록 맨 위에 모인다', async ({ page }) => {
  await startMeeting(page)
  await write(page, '발언', '예산 이야기를 했습니다')
  await write(page, '결정', '성탄절 예산 50만원으로 하기로 가결하다')
  await write(page, '할 일', '현수막 주문')

  await page.getByRole('link', { name: /회의록/ }).click()

  const paper = page.getByRole('article', { name: '회의록 문서' })
  await expect(paper.getByRole('heading', { name: '결정 사항' })).toBeVisible()
  // 같은 글이 '결정 사항' 과 '안건별 기록' 두 곳에 나온다. 결정 목록 쪽을 본다.
  await expect(page.locator('.paper__decisions')).toContainText('성탄절 예산 50만원으로 하기로 가결하다')
  await expect(paper.getByRole('heading', { name: '할 일' })).toBeVisible()
  await expect(paper.getByRole('cell', { name: '현수막 주문' })).toBeVisible()
})

test('메모는 회의록에 나가지 않는다 — 서기가 자기만 보려고 적은 것이다', async ({ page }) => {
  await startMeeting(page)
  await write(page, '결정', '그렇게 하기로 가결하다')
  await write(page, '메모', '이건 나만 보는 메모')

  await page.getByRole('link', { name: /회의록/ }).click()

  await expect(page.getByRole('article', { name: '회의록 문서' })).toBeVisible()
  await expect(page.getByText('이건 나만 보는 메모')).toHaveCount(0)
})

test('카톡에 붙는 글이 미리 보인다', async ({ page }) => {
  await startMeeting(page)
  await write(page, '결정', '예산 50만원으로 하기로 가결하다')

  await page.getByRole('link', { name: /회의록/ }).click()

  await expect(page.getByText('카톡에 붙는 모양')).toBeVisible()
  await expect(page.locator('.min__pre')).toContainText('■ 결정 사항')
  await expect(page.locator('.min__pre')).toContainText('1. 예산 50만원으로 하기로 가결하다')
})

test('안건을 만들면 그 뒤 줄이 그 안건에 붙는다', async ({ page }) => {
  await startMeeting(page)
  await page.getByRole('button', { name: '안건', exact: true }).click()
  await page.getByRole('textbox', { name: '새 안건 이름' }).fill('성탄절 준비')
  await page.getByRole('textbox', { name: '새 안건 이름' }).press('Enter')
  await write(page, '발언', '현수막부터 정하죠')

  await page.getByRole('link', { name: /회의록/ }).click()

  const paper = page.getByRole('article', { name: '회의록 문서' })
  await expect(paper.getByRole('heading', { name: /성탄절 준비/ })).toBeVisible()
})

test('앱을 닫았다 열어도 적은 줄이 남아 있다', async ({ page }) => {
  await startMeeting(page)
  await write(page, '결정', '이 줄은 남아야 한다')
  // 저장이 끝나기 전에 문서를 버리면 안 된다. 화면에 반영된 것을 먼저 확인한다.
  await expect(page.getByText('이 줄은 남아야 한다')).toBeVisible()

  await page.goto('/')
  await page.getByRole('link', { name: /결정 1건/ }).click()

  await expect(page.getByText('이 줄은 남아야 한다')).toBeVisible()
})

test('줄을 눌러 종류를 바꿀 수 있다 — 발언이라 적었는데 결정이었던 경우', async ({ page }) => {
  await startMeeting(page)
  await write(page, '발언', '그렇게 하죠')

  await page.getByRole('button', { expanded: false }).filter({ hasText: '그렇게 하죠' }).click()
  await page.getByRole('group', { name: '줄 종류 바꾸기' }).getByRole('button', { name: '결정' }).click()

  await page.getByRole('link', { name: /회의록/ }).click()
  await expect(page.getByRole('article', { name: '회의록 문서' })).toContainText('그렇게 하죠')
  await expect(page.locator('.paper__decisions')).toContainText('그렇게 하죠')
})

test('명부에 넣은 사람을 발언자로 고를 수 있다', async ({ page }) => {
  await page.goto('/#/people')
  await page.getByRole('button', { name: '장로' }).click()
  await page.getByRole('textbox', { name: '이름' }).fill('김영수')
  await page.getByRole('button', { name: '넣기' }).click()

  await startMeeting(page)
  await page.getByRole('group', { name: '말한 사람' }).getByRole('button', { name: '김영수' }).click()
  await write(page, '발언', '제가 말했습니다')

  await expect(page.locator('.row__who')).toHaveText('김영수 장로')
})

test('가로 넘침이 없다', async ({ page }) => {
  const sizes = [320, 375, 390, 768, 1024, 1440]
  await startMeeting(page)
  await write(page, '결정', '아주 긴 결정 문장을 적어서 가로로 넘치는지 본다 '.repeat(3))

  for (const width of sizes) {
    await page.setViewportSize({ width, height: 844 })
    for (const path of ['/', '/#/people', '/#/settings']) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `${width}px 에서 ${path}`).toBeLessThanOrEqual(0)
    }
  }
})

for (const theme of ['light', 'dark'] as const) {
  test(`접근성 ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await startMeeting(page)
    await write(page, '결정', '예산 50만원으로 하기로 가결하다')
    await write(page, '할 일', '현수막 주문')

    const capture = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(capture.violations).toEqual([])

    await page.getByRole('link', { name: /회의록/ }).click()
    await expect(page.getByRole('article', { name: '회의록 문서' })).toBeVisible()
    const doc = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(doc.violations).toEqual([])
  })
}
