import React from 'react'

type AnyRec = Record<string, any>

function isNonEmptyArray(x: any): x is any[] { return Array.isArray(x) && x.length > 0 }
function asArray<T=any>(x: any): T[] { return Array.isArray(x) ? x : (x ? [x] : []) }
function human(k: string) {
  return k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())
}
function periodToText(p?: AnyRec) {
  if (!p || (p.fecha_inicio==null && p.fecha_fin==null)) return '—'
  const a = p.fecha_inicio ?? ''
  const b = p.fecha_fin ?? ''
  return a && b ? `${a} → ${b}` : (a || b || '—')
}

// Normaliza claves típicas de tu NER al español (y algún typo)
function normalize(ex: AnyRec) {
  // soportá variantes y typos
  const datos_personales = ex.datos_personales ?? ex['datos-personales'] ?? ex.personales
  const experiencia_laboral = ex.experiencia_laboral ?? ex.experiencia ?? ex['experiencia-laboral']
  const educacion = ex.educación ?? ex.educacion
  const habilidades = ex.habilidades_técnicas ?? ex.habilidades ?? ex['habilidades-tecnicas']
  const idiomas = ex.idiomas ?? ex.idomas // <- typo común
  const certs = ex.certificaciones_y_cursos ?? ex.certificaciones ?? ex.cursos
  const otros = ex.otros ?? ex.extra ?? ex.adicional

  return { datos_personales, experiencia_laboral, educacion, habilidades, idiomas, certs, otros }
}

function ListChips({ items }:{ items: string[] }) {
  if (!isNonEmptyArray(items)) return <span className="text-slate-500">—</span>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s, i) => <span key={i} className="badge">{s}</span>)}
    </div>
  )
}

function KV({ label, children }:{label:string; children: React.ReactNode}) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div className="text-slate-500">{label}</div>
      <div className="col-span-2">{children}</div>
    </div>
  )
}

export default function ExtractedView({ value }:{ value: any }) {
  // Si viene string (OCR crudo), mostralo simple:
  if (typeof value === 'string') {
    return <pre className="text-sm whitespace-pre-wrap">{value}</pre>
  }
  if (!value || typeof value !== 'object') {
    return <div className="text-slate-500 text-sm">Sin datos para mostrar.</div>
  }

  const { datos_personales, experiencia_laboral, educacion, habilidades, idiomas, certs, otros } = normalize(value)

  // Datos personales
  const nombre = datos_personales?.name ?? datos_personales?.nombre
  const emails: string[] = asArray(datos_personales?.correo_electronico).filter(Boolean)
  const telefono: string | undefined = datos_personales?.telefono ?? datos_personales?.tel
  const direccion: string | undefined = datos_personales?.direccion

  return (
    <div className="space-y-6">
      {/* DATOS PERSONALES */}
      {(datos_personales) && (
        <section className="space-y-2">
          <h4 className="text-base font-semibold">Datos personales</h4>
          <div className="card space-y-2">
            {nombre && <KV label="Nombre">{nombre}</KV>}
            {emails.length > 0 && (
              <KV label="Email">
                <div className="flex flex-wrap gap-2">
                  {emails.map((e,i)=>(
                    <a key={i} href={`mailto:${e}`} className="badge">{e}</a>
                  ))}
                </div>
              </KV>
            )}
            {telefono && <KV label="Teléfono">{telefono}</KV>}
            {direccion && <KV label="Dirección">{direccion}</KV>}
            {!nombre && emails.length===0 && !telefono && !direccion && (
              <div className="text-slate-500 text-sm">—</div>
            )}
          </div>
        </section>
      )}

      {/* EXPERIENCIA */}
      {isNonEmptyArray(experiencia_laboral) && (
        <section className="space-y-2">
          <h4 className="text-base font-semibold">Experiencia laboral</h4>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Empresa</th>
                  <th className="th">Cargo</th>
                  <th className="th">Período</th>
                </tr>
              </thead>
              <tbody>
                {experiencia_laboral.map((it: AnyRec, i:number)=>(
                  <tr key={i} className="row">
                    <td className="td">{it.empresa ?? '—'}</td>
                    <td className="td">{it.cargo ?? '—'}</td>
                    <td className="td">{periodToText(it.periodo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* EDUCACIÓN */}
      {isNonEmptyArray(educacion) && (
        <section className="space-y-2">
          <h4 className="text-base font-semibold">Educación</h4>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Institución</th>
                  <th className="th">Título</th>
                  <th className="th">Período</th>
                </tr>
              </thead>
              <tbody>
                {educacion.map((it: AnyRec, i:number)=>(
                  <tr key={i} className="row">
                    <td className="td">{it.institución ?? it.institucion ?? '—'}</td>
                    <td className="td">{it.título ?? it.titulo ?? '—'}</td>
                    <td className="td">{periodToText(it.periodo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* HABILIDADES */}
      {isNonEmptyArray(habilidades) && (
        <section className="space-y-2">
          <h4 className="text-base font-semibold">Habilidades técnicas</h4>
          <div className="card">
            <ListChips items={habilidades} />
          </div>
        </section>
      )}

      {/* IDIOMAS */}
      {isNonEmptyArray(idiomas) && (
        <section className="space-y-2">
          <h4 className="text-base font-semibold">Idiomas</h4>
          <div className="card space-y-2">
            {idiomas.map((it: AnyRec, i:number)=>(
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="badge">{it.idioma ?? '—'}</span>
                <span className="text-slate-500">— {it.nivel ?? '—'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CERTS */}
      {Array.isArray(certs) && (
        <section className="space-y-2">
          <h4 className="text-base font-semibold">Certificaciones y cursos</h4>
          <div className="card">
            {certs.length ? (
              <ul className="list-disc pl-6 text-sm space-y-1">
                {certs.map((c,i)=><li key={i}>{String(c)}</li>)}
              </ul>
            ) : <span className="text-slate-500 text-sm">—</span>}
          </div>
        </section>
      )}

      {/* OTROS */}
      {otros && (
        <section className="space-y-2">
          <h4 className="text-base font-semibold">Otros</h4>
          <div className="card">
            {Array.isArray(otros) ? (
              <ul className="list-disc pl-6 text-sm space-y-1">
                {otros.map((o,i)=><li key={i}>{typeof o==='string' ? o : JSON.stringify(o)}</li>)}
              </ul>
            ) : (
              <div className="text-sm">
                {typeof otros === 'object'
                  ? Object.entries(otros).map(([k,v])=>(
                      <div key={k} className="grid grid-cols-3 gap-2">
                        <div className="text-slate-500">{human(k)}</div>
                        <div className="col-span-2">{typeof v==='string' ? v : JSON.stringify(v)}</div>
                      </div>
                    ))
                  : String(otros)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Si ninguna sección matcheó, mostrás un resumen key/value simple */}
      {!datos_personales && !experiencia_laboral && !educacion && !habilidades && !idiomas && !certs && !otros && (
        <div className="text-sm">
          <p className="text-slate-500 mb-2">No se detectaron secciones conocidas. Vista genérica:</p>
          <div className="space-y-1">
            {Object.entries(value).map(([k,v])=>(
              <div key={k} className="grid grid-cols-3 gap-2">
                <div className="text-slate-500">{human(k)}</div>
                <div className="col-span-2">{typeof v==='string' ? v : JSON.stringify(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
