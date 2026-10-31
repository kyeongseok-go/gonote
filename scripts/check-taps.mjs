// 손가락이 닿는 것이 44px 밑으로 내려가지 않는지 잰다(Apple HIG 최소 터치 영역).
// 추측하지 않고 실제로 그려진 상자를 잰다. 못 넓히는 것이 있으면 목록으로 남긴다.
//
// 실행: node scripts/check-taps.mjs
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 5177
const base = `http://localhost:${PORT}`
const MIN = 44

async function waitFor(url, tries = 80) {
  for (let i = 0; i < tries; i += 1) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // 아직 안 떴다
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`서버가 뜨지 않았어요: ${url}`)
}

/** 그려진 상자가 44px 미만인 누를 것들. 숨어 있는 것은 뺀다. */
async function smallTargets(page) {
  return page.evaluate((min) => {
    const nodes = [...document.querySelectorAll('button, a[href], input, textarea, select')]
    return nodes
      .filter((node) => !node.classList.contains('sr-only'))
      .map((node) => {
        const box = node.getBoundingClientRect()
        return {
          tag: node.tagName.toLowerCase(),
          cls: node.getAttribute('class') ?? '',
          text: (node.textContent ?? '').trim().slice(0, 18),
          w: Math.round(box.width),
          h: Math.round(box.height),
        }
      })
      .filter((row) => row.w > 0 && row.h > 0 && (row.w < min || row.h < min))
  }, MIN)
}

const server = spawn('pnpm', ['exec', 'vite', '--port', String(PORT)], { cwd: root, stdio: 'ignore' })
const browser = await chromium.launch()
const found = []

try {
  await waitFor(`${base}/`)
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto(`${base}/`)
  await page.waitForFunction(() => Boolean(window.__gonote), null, { timeout: 15_000 })
  const meetingId = await page.evaluate(() => window.__gonote.seedDemo({ closed: true, recording: true }))

  const screens = [
    { name: '회의 목록', path: '' },
    { name: '받아적기', path: `m/${meetingId}` },
    { name: '회의 정보', path: `m/${meetingId}/info` },
    { name: '회의록', path: `m/${meetingId}/doc` },
    { name: '명부', path: 'people' },
    { name: '설정', path: 'settings' },
  ]

  for (const screen of screens) {
    await page.goto(`${base}/#/${screen.path}`)
    await page.waitForSelector('h1', { timeout: 15_000 })
    for (const row of await smallTargets(page)) found.push({ screen: screen.name, ...row })
  }

  // 줄을 펼친 상태(고치기 칸)도 잰다 — 여기 버튼이 가장 많다
  await page.goto(`${base}/#/m/${meetingId}`)
  await page.waitForSelector('.row__main')
  await page.locator('.row__main').last().click()
  await page.waitForSelector('.row__edit')
  for (const row of await smallTargets(page)) found.push({ screen: '줄 고치기', ...row })

  await context.close()
} finally {
  await browser.close()
  server.kill()
}

if (found.length === 0) {
  process.stdout.write(`터치 영역 검사 통과: ${MIN}px 미만이 한 곳도 없어요\n`)
} else {
  process.stdout.write(`${MIN}px 미만 ${found.length}곳:\n`)
  for (const row of found) {
    process.stdout.write(`  ${row.screen} · ${row.tag}.${row.cls.split(' ')[0]} "${row.text}" ${row.w}×${row.h}\n`)
  }
  process.exitCode = 1
}
