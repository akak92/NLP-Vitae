import { useMemo } from 'react'

export default function JSONPretty({ value }:{ value: unknown }){
  const text = useMemo(()=>{
    try { return JSON.stringify(value, null, 2) } catch { return String(value) }
  },[value])
  return (
    <pre className="text-xs overflow-auto bg-slate-950 text-slate-100 rounded-xl p-3">
      {text}
    </pre>
  )
}