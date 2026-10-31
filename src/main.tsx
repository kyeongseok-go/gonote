import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './styles/tokens.css'
import './styles/base.css'
import { App } from './app/App'

const root = document.getElementById('root')
if (!root) throw new Error('#root 가 없어요')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
