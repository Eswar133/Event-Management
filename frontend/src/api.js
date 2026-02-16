const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

function qs(params = {}){
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k,v])=>{ if (v !== undefined && v !== null && v !== '') s.set(k, v); });
  const str = s.toString();
  return str ? ('?' + str) : '';
}

export async function api(path, opts = {}){
  const headers = opts.headers || {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...opts, headers });
  try { return await res.json(); } catch(e){ return { error: 'Invalid JSON response' }; }
}

export async function login(email, password){
  return api('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password}) });
}

export async function register(name, email, password){
  return api('/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name, email, password}) });
}

export async function getEvents(params = {}){
  return api('/api/events' + qs(params));
}

export async function me(){
  return api('/api/me');
}

export async function registerEvent(eventId){
  return api(`/api/events/${eventId}/register`, { method: 'POST' });
}

export async function cancelRegistration(eventId){
  return api(`/api/events/${eventId}/register`, { method: 'DELETE' });
}
