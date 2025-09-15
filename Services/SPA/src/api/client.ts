import { useSettings } from '../state/settings'

async function http<T=unknown>(path: string, init?: RequestInit): Promise<T> {
  const base = useSettings.getState().baseUrl
  const res = await fetch(base + path, init)
  if (!res.ok) {
    const text = await res.text().catch(()=>'')
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json() as Promise<T>
  // @ts-ignore
  return res as unknown as T
}

export const api = {
  get: <T=unknown>(path: string) => http<T>(path),
  postJson: <T=unknown>(path: string, body: unknown) =>
    http<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  postForm: <T=unknown>(path: string, form: FormData) =>
    http<T>(path, { method: 'POST', body: form }),
}