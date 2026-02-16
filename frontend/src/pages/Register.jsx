import React, {useState} from 'react'
import { register } from '../api'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e){
    e.preventDefault();
    const res = await register(name, email, password);
    if (res.token) {
      localStorage.setItem('token', res.token);
      setMsg('Registered');
      window.location.href = '/dashboard';
    } else setMsg(res.error || 'Register failed');
  }

  return (
    <div style={{padding:20}}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div><input placeholder="name" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button>Register</button>
      </form>
      <div>{msg}</div>
    </div>
  )
}
