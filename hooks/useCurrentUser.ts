import { useEffect, useState } from 'react'
export function useCurrentUser(){ const [user,setUser]=useState(null); useEffect(()=>{/* fetch user */},[]); return user }
