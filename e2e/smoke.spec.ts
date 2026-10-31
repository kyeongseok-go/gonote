import { expect, test } from '@playwright/test'

test('앱 껍데기가 뜬다', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
