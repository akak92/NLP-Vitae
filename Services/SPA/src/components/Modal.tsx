import { ReactNode, useEffect } from 'react'

export default function Modal({ open, title, onClose, children }:{
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(()=> {
    function onEsc(e: KeyboardEvent){ if(e.key === 'Escape') onClose() }
    if(open){ window.addEventListener('keydown', onEsc) }
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if(!open) return null
  return (
    <div className="modal-backdrop grid place-items-center" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  )
}