import React, {useEffect, useState} from 'react'
import { getEvents, registerEvent, cancelRegistration, me } from '../api'

export default function Home(){
  const [events, setEvents] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [myRegs, setMyRegs] = useState([])

  async function load(){
    const d = await getEvents({ q, category, page, limit: 5 });
    setEvents(d.events || []);
    setTotal(d.total || 0);
  }

  useEffect(()=>{ load() },[q, category, page])

  useEffect(()=>{
    me().then(r=>{ if (r.user) {
      fetch('http://localhost:4000/api/me/registrations', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
        .then(res=>res.json()).then(d=>setMyRegs((d.registrations||[]).map(x=>x.id)))
    }})
  },[])

  async function handleRegister(id){
    const r = await registerEvent(id);
    if (!r.error) {
      setMyRegs(prev=>[...new Set([...prev, parseInt(id)])]);
      load();
    } else alert(r.error);
  }

  async function handleCancel(id){
    const r = await cancelRegistration(id);
    if (!r.error) {
      setMyRegs(prev=>prev.filter(x=>x!==parseInt(id)));
      load();
    } else alert(r.error);
  }

  return (
    <div style={{padding:20}}>
      <h1>Events</h1>
      <div style={{marginBottom:12}}>
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
        <input placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} style={{marginLeft:8}} />
      </div>
      {events.length===0 && <div>No events found</div>}
      <ul>
        {events.map(e=> (
          <li key={e.id} style={{marginBottom:12}}>
            <strong>{e.name}</strong> — {e.location} — {e.datetime}
            <div>{e.description}</div>
            <div>Capacity: {e.capacity} — Registered: {e.registered ?? '-'}</div>
            { myRegs.includes(e.id) ? (
              <button onClick={()=>handleCancel(e.id)}>Cancel registration</button>
            ) : (
              <button onClick={()=>handleRegister(e.id)}>Register</button>
            )}
          </li>
        ))}
      </ul>
      <div style={{marginTop:12}}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Prev</button>
        <span style={{margin: '0 8px'}}>Page {page}</span>
        <button onClick={()=>setPage(p=>p+1)} disabled={page * 5 >= total}>Next</button>
      </div>
    </div>
  )
}
