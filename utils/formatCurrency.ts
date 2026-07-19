export function formatCurrency(n: number){ return new Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(n) }
