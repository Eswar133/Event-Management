import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function NavBar({ loggedIn, onLogout }) {
  return (
    <nav>
      <Link to="/">Home</Link>
      {loggedIn ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  )
}

export default function App(){
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  useEffect(()=>{
    const handler = () => setLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },[]);

  function handleLogout() {
    localStorage.removeItem('token');
    setLoggedIn(false);
    window.location.href = '/';
  }

  return (
    <BrowserRouter>
      <NavBar loggedIn={loggedIn} onLogout={handleLogout} />
      <div className="centered-content">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
