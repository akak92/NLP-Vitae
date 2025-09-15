import { ReactNode } from 'react'

export type Column<T> = {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

export default function DataTable<T>({ rows, columns }:{
  rows: T[]
  columns: Column<T>[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c,i)=>(<th key={i} className={"th "+(c.className??'')}>{c.header}</th>))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx)=>(
            <tr key={idx} className="row">
              {columns.map((c,i)=>(<td key={i} className={"td "+(c.className??'')}>{c.cell(r)}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}