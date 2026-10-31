import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './styles/tokens.css'
import './styles/base.css'
import { App } from './app/App'

if (import.meta.env.DEV) {
  // 개발 서버와 스크린샷 스크립트에서 샘플 회의를 넣을 수 있게 노출한다.
  // 프로덕션 번들에는 들어가지 않는다 — 회의록 앱에 가짜 회의가 생기면 안 된다.
  void Promise.all([import('./dev/seed'), import('./store/app')]).then(([{ seedDemo }, { useApp }]) => {
    ;(window as unknown as { __gonote: unknown }).__gonote = { seedDemo, store: useApp }
  })
}

const root = document.getElementById('root')
if (!root) throw new Error('#root 가 없어요')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
