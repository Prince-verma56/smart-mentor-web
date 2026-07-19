export default function EmptyState({message}:{message?:string}){
  return <div>{message ?? 'Nothing here yet'}</div>
}
