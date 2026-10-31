// 설정. **새 회의에 미리 채워 둘 값**이 여기 있다 — 교회 회의는 종류·장소·서기가 매번 같다.
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Download, Upload } from 'lucide-react'
import { useApp } from '../../store/app'
import { backupFileName, buildBackup, readBackup } from './backup'
import './settings.css'

const THEMES = [
  { value: 'auto', label: '자동' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
] as const

export function SettingsScreen() {
  const settings = useApp((s) => s.settings)
  const entities = useApp((s) => s.entities)
  const updateSettings = useApp((s) => s.updateSettings)
  const clearEverything = useApp((s) => s.clearEverything)
  const importBackup = useApp((s) => s.importBackup)
  const picker = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState<string | null>(null)

  /** 파일로 내려받는다. 아이폰 사파리에서는 '파일' 앱에 저장된다. */
  const exportFile = () => {
    const at = new Date().toISOString()
    const text = JSON.stringify(buildBackup(entities, settings, at), null, 2)
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName(at)
    link.click()
    // 바로 놓아주면 저장이 시작되기 전에 주소가 사라지는 기기가 있다.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    setNotice(`내보냈어요: ${backupFileName(at)}`)
  }

  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // 같은 파일을 두 번 고를 수 있게 비워 둔다.
    event.target.value = ''
    if (!file) return
    try {
      const read = readBackup(JSON.parse(await file.text()))
      if (!read.backup) {
        setNotice(read.message)
        return
      }
      importBackup(read.backup)
      setNotice(`가져왔어요. ${read.message}`)
    } catch {
      setNotice('파일을 읽지 못했어요. JSON 파일이 맞는지 봐 주세요.')
    }
  }

  return (
    <main className="set">
      <header className="set__top">
        <Link to="/" className="set__back" aria-label="회의 목록으로">
          <ChevronLeft size={22} aria-hidden="true" />
        </Link>
        <h1>설정</h1>
      </header>

      <section className="set__block">
        <h2 className="set__h">새 회의에 미리 채울 것</h2>
        <p className="set__hint">회의를 시작할 때마다 다시 치지 않게 해 둬요. 회의 안에서 고칠 수 있어요.</p>

        <label className="set__field">
          <span>회의 종류</span>
          <input
            value={settings.defaultKind}
            placeholder="제직회, 당회, 부서 회의…"
            onChange={(event) => updateSettings({ defaultKind: event.target.value })}
          />
        </label>
        <label className="set__field">
          <span>장소</span>
          <input
            value={settings.defaultPlace}
            placeholder="본당 2층 회의실"
            onChange={(event) => updateSettings({ defaultPlace: event.target.value })}
          />
        </label>
        <label className="set__field">
          <span>서기(작성자)</span>
          <input
            value={settings.defaultScribe}
            placeholder="이름"
            onChange={(event) => updateSettings({ defaultScribe: event.target.value })}
          />
        </label>
      </section>

      <section className="set__block">
        <h2 className="set__h">공유할 때</h2>
        <button
          type="button"
          className={`set__toggle${settings.shareIncludesSpeech ? ' set__toggle--on' : ''}`}
          aria-pressed={settings.shareIncludesSpeech}
          onClick={() => updateSettings({ shareIncludesSpeech: !settings.shareIncludesSpeech })}
        >
          <span>
            <span className="set__tlabel">발언 기록까지 넣기</span>
            <span className="set__thint">
              끄면 결정·할 일만 나가요. 카톡에서는 짧은 쪽이 훨씬 잘 읽혀요.
            </span>
          </span>
          <span className="set__pill">{settings.shareIncludesSpeech ? '켜짐' : '꺼짐'}</span>
        </button>
        <button
          type="button"
          className={`set__toggle${settings.shareHidesNames ? ' set__toggle--on' : ''}`}
          aria-pressed={settings.shareHidesNames}
          onClick={() => updateSettings({ shareHidesNames: !settings.shareHidesNames })}
        >
          <span>
            <span className="set__tlabel">공유할 때 발언자 이름 가리기</span>
            <span className="set__thint">
              카톡으로 넓게 돌릴 때 켜요. 이름이 직분으로 바뀌어요(김영수 장로 → 장로). 인쇄하는 회의록
              원본은 늘 실명이에요.
            </span>
          </span>
          <span className="set__pill">{settings.shareHidesNames ? '가림' : '실명'}</span>
        </button>
        <p className="set__hint">
          <strong>메모</strong>로 적은 줄은 어떤 경우에도 회의록·공유 글에 나가지 않아요.
        </p>
      </section>

      <section className="set__block">
        <h2 className="set__h">화면</h2>
        <div className="set__pills" role="group" aria-label="화면 테마">
          {THEMES.map((each) => (
            <button
              key={each.value}
              type="button"
              className={`chip${settings.theme === each.value ? ' chip--on' : ''}`}
              aria-pressed={settings.theme === each.value}
              onClick={() => updateSettings({ theme: each.value })}
            >
              {each.label}
            </button>
          ))}
        </div>
      </section>

      <section className="set__block">
        <h2 className="set__h">명부</h2>
        <Link to="/people" className="set__link">
          명부 고치기
        </Link>
      </section>

      <section className="set__block">
        <h2 className="set__h">사용법</h2>
        <Link to="/help" className="set__link">
          어떻게 쓰는지 보기
        </Link>
      </section>

      <section className="set__block">
        <h2 className="set__h">백업</h2>
        <p className="set__hint">
          회의록은 <strong>이 폰 안에만</strong> 있어요. 폰을 바꾸거나 사파리 자료를 지우면 사라져요.
          가끔 내보내서 파일로 두면 안전해요.
        </p>
        <div className="set__row">
          <button type="button" className="set__link" onClick={exportFile}>
            <Download size={16} aria-hidden="true" />
            파일로 내보내기
          </button>
          <button type="button" className="set__link" onClick={() => picker.current?.click()}>
            <Upload size={16} aria-hidden="true" />
            파일에서 가져오기
          </button>
          <input
            ref={picker}
            type="file"
            accept="application/json,.json"
            className="set__file"
            aria-label="백업 파일 고르기"
            tabIndex={-1}
            onChange={importFile}
          />
        </div>
        {notice ? (
          <p className="set__notice" role="status">
            {notice}
          </p>
        ) : null}
      </section>

      <section className="set__block set__block--danger">
        <h2 className="set__h">모두 지우기</h2>
        <p className="set__hint">
          회의·안건·기록·명부가 전부 사라져요. 되돌릴 수 없어요. 이 폰 안에만 있던 자료예요.
        </p>
        <button
          type="button"
          className="set__danger"
          onClick={() => {
            if (window.confirm('회의록 전체를 지울까요? 되돌릴 수 없어요.')) void clearEverything()
          }}
        >
          전부 지우기
        </button>
      </section>

      <p className="set__about">
        gonote — 적은 것이 그대로 회의록이 되는 앱. 자료는 이 기기 안에만 있고 서버로 가지 않아요.
      </p>
    </main>
  )
}
