export function debounce<T extends (...args:any[])=>any>(fn:T, wait=300){ let t:any; return (...a:any[])=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),wait) } }
