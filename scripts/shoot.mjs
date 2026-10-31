// 화면을 찍어 **직접 눈으로 본다.** 테스트가 통과하는 못생긴 화면이 가장 흔한 실패다.
// 가로 넘침도 샷마다 함께 잰다.
//
// 실행: node scripts/shoot.mjs            (개발 서버, 시드 가능)
//       node scripts/shoot.mjs --preview  (프로덕션 빌드, 시드 없음)
import { mkdirSync, rmSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'shots')
const usePreview = process.argv.includes('--preview')
const PORT = usePreview ? 4176 : 5176
const base = `http://localhost:${PORT}`

/** 찍을 것. seed 가 있으면 샘플 회의를 넣고 그 회의로 들어간다. */
const SHOTS = [
  { name: '01-목록-빈', path: '', width: 390, height: 844 },
  { name: '02-목록', path: '', width: 390, height: 844, seed: {} },
  { name: '03-받아적기', path: 'MEETING', width: 390, height: 844, seed: { recording: true } },
  { name: '04-받아적기-빈', path: 'MEETING_EMPTY', width: 390, height: 844 },
  { name: '05-회의록', path: 'MEETING/doc', width: 390, height: 844, seed: { closed: true } },
  { name: '06-회의록-아래', path: 'MEETING/doc', width: 390, height: 844, seed: { closed: true }, scroll: 900 },
  { name: '07-회의정보', path: 'MEETING/info', width: 390, height: 844, seed: {} },
  { name: '08-명부', path: 'people', width: 390, height: 844, seed: {} },
  { name: '09-설정', path: 'settings', width: 390, height: 844 },
  { name: '10-회의록-다크', path: 'MEETING/doc', width: 390, height: 844, seed: { closed: true }, dark: true },
  { name: '11-받아적기-다크', path: 'MEETING', width: 390, height: 844, seed: {}, dark: true },
  { name: '12-회의록-데스크톱', path: 'MEETING/doc', width: 1440, height: 1000, seed: { closed: true } },
  { name: '13-목록-태블릿', path: '', width: 768, height: 1024, seed: {} },
  { name: '14-받아적기-작은폰', path: 'MEETING', width: 320, height: 568, seed: {} },
  // 실제로 인쇄되는 모습. A4 를 96dpi 로 환산한 크기다(210mm × 297mm).
  { name: '15-인쇄-A4', path: 'MEETING/doc', width: 794, height: 1123, seed: { closed: true }, print: true },
]

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

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const command = usePreview
  ? ['exec', 'vite', 'preview', '--port', String(PORT)]
  : ['exec', 'vite', '--port', String(PORT)]
if (usePreview) spawn('pnpm', ['build'], { cwd: root, stdio: 'ignore' })
const server = spawn('pnpm', command, { cwd: root, stdio: 'ignore' })
const browser = await chromium.launch()

try {
  await waitFor(`${base}/`)

  for (const shot of SHOTS) {
    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      colorScheme: shot.dark ? 'dark' : 'light',
      locale: 'ko-KR',
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()
    await page.goto(`${base}/`)
    await page.waitForFunction(() => Boolean(window.__gonote) || true, null, { timeout: 10_000 })

    let meetingId = null
    if (shot.seed) {
      meetingId = await page.evaluate((options) => window.__gonote.seedDemo(options), shot.seed)
    } else if (shot.path.startsWith('MEETING')) {
      // 시드 없이 받아적기 화면을 보려면 빈 회의를 하나 만든다
      meetingId = await page.evaluate(() => window.__gonote.store.getState().createMeeting().id)
    }

    const path = shot.path.replace('MEETING_EMPTY', `m/${meetingId}`).replace('MEETING', `m/${meetingId}`)
    await page.goto(`${base}/#/${path}`)
    await page.waitForSelector('h1', { timeout: 15_000 })
    // 글꼴이 다 오기 전에 찍으면 줄바꿈이 다르게 나온다
    await page.evaluate(() => document.fonts.ready)
    if (shot.print) await page.emulateMedia({ media: 'print' })
    if (shot.scroll) await page.evaluate((y) => window.scrollTo(0, y), shot.scroll)
    await page.waitForTimeout(250)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    await page.screenshot({ path: join(out, `${shot.name}.png`), fullPage: Boolean(shot.print) })
    process.stdout.write(
      `${shot.name}  ${shot.width}×${shot.height}${shot.dark ? ' 다크' : ''}  넘침 ${Math.max(0, overflow)}px\n`,
    )
    await context.close()
  }
  process.stdout.write(`\n찍은 곳: ${out}\n`)
} finally {
  await browser.close()
  server.kill()
}
