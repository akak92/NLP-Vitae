import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FilesAPI, HealthAPI, UploadAPI, DownloadAPI, PictureAPI } from '../api/nlpvitae'
import { useMemo, useState } from 'react'
import DataTable, { Column } from '../components/DataTable'
import Modal from '../components/Modal'
import ExtractedView from '../components/ExtractedView';
import Avatar from '../components/Atavar'

type AnyRec = Record<string, any>;

function entriesFrom(x: unknown): any[] {
  // 1) Si ya es array, listo
  if (Array.isArray(x)) return x;
  // 2) Si es objeto, probá claves típicas
  if (x && typeof x === 'object') {
    const o = x as AnyRec;
    for (const k of ['items','results','data','files','rows','documents','records','list']) {
      if (Array.isArray(o[k])) return o[k] as any[];
    }
    // 3) Fallback: objeto tipo diccionario {id: {...}, id2: {...}}
    const vals = Object.values(o);
    if (vals.length && vals.every(v => v && typeof v === 'object')) return vals as any[];
  }
  return [];
}

function pickNERData(file: AnyRec) {
  // Busca dentro de `results` el bloque NER → .data
  if (Array.isArray(file.results)) {
    const ner = file.results.find((r: AnyRec) => r?.process === 'NER');
    if (ner?.data != null) return ner.data;
    // fallback a primer .data por si no viene NER
    const first = file.results.find((r: AnyRec) => r?.data != null);
    if (first?.data != null) return first.data;
  }
  return undefined;
}

function normalize(rows: any[]): {
  id?: string;
  name?: string;
  created?: string;
  status?: string | boolean;
  raw: AnyRec;
  extracted?: any;
}[] {
  return rows.map((r: AnyRec) => {
    const id = r.file_id ?? r._id ?? r.id ?? r.uuid;
    const name = r.name ?? r.filename ?? r.file_name ?? '—';
    const created = r.creation_date ?? r.created_at ?? r.created ?? r.date ?? '—';

    // "Procesado" si picture_id tiene un valor; si es null/undefined (o no existe), "Procesando"
    const status = r.picture_id != null ? 'Procesado' : 'Procesando';

    const extracted = pickNERData(r) ?? r.extracted ?? r.entities ?? r.result ?? r.data;
    return { id, name, created, status, raw: r, extracted };
  });
}



export default function Home(){
  const qc = useQueryClient()
  const filesQ = useQuery({ queryKey:['files'], queryFn: FilesAPI.getAll })
  const healthQ = useQuery({ queryKey:['health'], queryFn: HealthAPI.check })

  const [selectedFile, setSelectedFile] = useState<File|null>(null)
  const uploadM = useMutation({
    mutationFn: (f: File) => UploadAPI.uploadPdf(f),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['files'] }) }
  })

  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerTitle, setViewerTitle] = useState('')
  const [viewerData, setViewerData] = useState<any>(null)

  const [viewerPicUrl, setViewerPicUrl] = useState<string | undefined>(undefined)


  const rows = useMemo(() => {
    const arr = entriesFrom(filesQ.data);
    return normalize(arr);
  }, [filesQ.data]);

  const columns = useMemo<Column<(typeof rows)[number]>[]>(()=>[
    { header: 'Archivo', cell: r => r.name ?? '—' },
    { header: 'Fecha', cell: r => r.created ?? '—', className: 'whitespace-nowrap' },
    { header: 'Estado', cell: r => {
        const isDone = r.status === 'Procesado'
        const cls = isDone
          ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-700 dark:text-emerald-100'
          : 'bg-yellow-200 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100'
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>
            {r.status}
          </span>
        )
      }
    },
    { header: 'Acciones', cell: r => (
      <div className="flex gap-2">
        <button
          className="btn"
          onClick={()=>{
            setViewerTitle(`Datos extraídos${r.name?` · ${r.name}`:''}`)
            setViewerData(r.extracted ?? r.raw)

            // 1) armá la URL en una variable local
            const picId = r.raw?.picture_id
            const url = picId
              ? PictureAPI.byId(String(picId))
              : (r.id ? PictureAPI.byFile(String(r.id)) : undefined)

            // 2) logueá la URL local (NO el state)
            console.log('pic url:', url, 'doc:', r.raw)

            // 3) recién ahora actualizá el state
            setViewerPicUrl(url)
            setViewerOpen(true)
          }}
        >
          Ver datos
        </button>
        {r.id && (
          <a className="btn" href={DownloadAPI.url(String(r.id))} target="_blank" rel="noreferrer">
            Descargar
          </a>
        )}
      </div>
    )}

  ],[rows])

  return (
    <div className="space-y-6">
      <section className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <div className="font-semibold">Subir PDF</div>
          <input className="input" type="file" accept="application/pdf" onChange={(e)=>setSelectedFile(e.target.files?.[0]||null)} />
          <button className="btn w-full" disabled={!selectedFile || uploadM.isPending}
            onClick={()=> selectedFile && uploadM.mutate(selectedFile)}>
            {uploadM.isPending ? 'Subiendo…' : 'Subir'}
          </button>
          {uploadM.isError && <div className="text-red-600 text-sm">{String(uploadM.error)}</div>}
          {uploadM.isSuccess && <div className="text-xs text-green-700">Archivo subido con éxito.</div>}
        </div>

        <div className="card space-y-3">
          <div className="font-semibold">Salud del servicio</div>
          {healthQ.isLoading ? 'Cargando…' : healthQ.isError ? <span className="text-red-600">Error</span> : (
            <div className="text-sm">OK</div>
          )}
        </div>
      </section>

      <section className="card space-y-3">
        <div className="font-semibold">Listado de archivos</div>
        {filesQ.isLoading && 'Cargando…'}
        {filesQ.isError && <div className="text-red-600 text-sm">{String(filesQ.error)}</div>}
        {filesQ.isSuccess && rows.length===0 && <div className="text-sm text-slate-500">Sin registros</div>}
        {filesQ.isSuccess && rows.length>0 && (
          <DataTable rows={rows} columns={columns} />
        )}
      </section>

    <Modal open={viewerOpen} title={viewerTitle} onClose={()=>setViewerOpen(false)}>
      <div className="relative">
        {/* Avatar fijo arriba a la derecha */}
        <Avatar
          src={viewerPicUrl}
          // Nombre para las iniciales (intenta tomar del JSON; si no, usa el título del modal)
          name={(() => {
            const dp = (viewerData as any)?.datos_personales
            return dp?.name ?? dp?.nombre ?? viewerTitle
          })()}
          size={96}
          rounded="xl"
          className="absolute top-0 right-0"
        />

        {/* Dejamos espacio para que el contenido no quede debajo del avatar */}
        <div className="pr-28">
          <ExtractedView value={viewerData} pictureUrl={viewerPicUrl} />
        </div>
      </div>
    </Modal>
    </div>
  )
}