import { useSettings } from '../state/settings'
export default function Settings(){
  const { baseUrl, set } = useSettings()
  return (
    <div className="card space-y-3">
      <div className="font-semibold">Ajustes</div>
      <label className="label">Base URL del backend</label>
      <input className="input" value={baseUrl} onChange={e=>set({ baseUrl: e.target.value })} />
      <p className="text-xs text-slate-500">Ej: http://localhost:8000</p>
    </div>
  )
}