import JSONPretty from './JSONPretty'
export default function ResultCard({title, data}:{title:string, data:any}){
  return (
    <div className="card space-y-2">
      <div className="font-semibold">{title}</div>
      <JSONPretty value={data} />
    </div>
  )
}