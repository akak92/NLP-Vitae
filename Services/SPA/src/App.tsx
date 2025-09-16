import { Outlet, Link, useLocation } from 'react-router-dom'
import Topbar from './components/Topbar'

export default function App() {
  const loc = useLocation()
  return (
    <div>
      <Topbar />
      <main className="container my-6 space-y-6">
        <nav className="flex gap-2 text-sm">
          <Link to="/" className={loc.pathname==='/'?'underline':''}>Inicio</Link>
          <span>·</span>
          <Link to="/search" className={loc.pathname.startsWith('/search')?'underline':''}>Búsqueda</Link>
          <span>·</span>
          <Link to="/settings" className={loc.pathname.startsWith('/settings')?'underline':''}>Ajustes</Link>
        </nav>
        <Outlet />
      </main>
    </div>
  )
}