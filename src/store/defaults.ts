import type { Settings } from '../domain/types'

export function defaultSettings(): Settings {
  return {
    id: 'settings',
    theme: 'auto',
    defaultKind: '',
    defaultPlace: '',
    defaultScribe: '',
    // 기본은 결정·할 일만. 발언까지 넣으면 카톡에서 길어서 아무도 안 읽는다.
    shareIncludesSpeech: false,
    // 기본은 실명. 회의록은 누가 말했는지가 기록의 일부다. 넓게 돌릴 때만 켠다.
    shareHidesNames: false,
  }
}

/** 저장된 설정에 새로 생긴 필드를 기본값으로 채운다. 예전 버전에서 저장된 행도 그대로 쓴다. */
export function mergeSettings(stored: Partial<Settings> | null | undefined): Settings {
  const base = defaultSettings()
  if (!stored) return base
  return { ...base, ...stored, id: 'settings' }
}
