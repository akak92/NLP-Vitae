export default function Topbar(){
  return (
    <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur sticky top-0 z-10">
      <div className="container py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Extractor de CV · NLP</h1>
        <a href="/settings" className="btn">Ajustes</a>
      </div>
    </header>
  )
}