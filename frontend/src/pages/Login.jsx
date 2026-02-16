import React, {useState} from 'react'
import { login } from '../api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e){
    e.preventDefault();
    const res = await login(email, password);
    if (res.token) {
      localStorage.setItem('token', res.token);
      setMsg('Logged in');
      window.location.href = '/dashboard';
    } else setMsg(res.error || 'Login failed');
  }

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button>Login</button>
      </form>
      <div>{msg}</div>
    </div>
  )
}
