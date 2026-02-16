import React, {useEffect, useState} from 'react'
import { me, api } from '../api'

function isPast(dateStr) {
  return new Date(dateStr) < new Date();
}

function isUpcoming(dateStr) {
  return new Date(dateStr) >= new Date();
}

export default function Dashboard(){
  const [user, setUser] = useState(null)
  const [regs, setRegs] = useState([])

  useEffect(()=>{
    me().then(r=>{ if (r.user) setUser(r.user); })
    api('/api/me/registrations').then(d=>setRegs(d.registrations || []))
  },[])

  if (!user) return <div style={{padding:20}}>Please login to view dashboard</div>

  const upcoming = regs.filter(r=>isUpcoming(r.datetime));
  const past = regs.filter(r=>isPast(r.datetime));

  return (
    <div style={{padding:20}}>
      <h2>Welcome, {user.name}</h2>
      <h3>Upcoming Events</h3>
      {upcoming.length === 0 && <div>No upcoming events</div>}
      <ul>
        {upcoming.map(r=> <li key={r.id}><b>{r.name}</b> — {r.datetime} @ {r.location} <br/>Capacity: {r.capacity} <br/>{r.description}</li>)}
      </ul>
      <h3>Past Events</h3>
      {past.length === 0 && <div>No past events</div>}
      <ul>
        {past.map(r=> <li key={r.id}><b>{r.name}</b> — {r.datetime} @ {r.location} <br/>Capacity: {r.capacity} <br/>{r.description}</li>)}
      </ul>
      <h3>All Registered Events</h3>
      <ul>
        {regs.map(r=> <li key={r.id}>{r.name} — {r.datetime}</li>)}
      </ul>
    </div>
  )
}
