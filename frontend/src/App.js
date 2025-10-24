import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Payment from './pages/Payment';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';

import './styles.css';

export default function App(){
  return (
    <BrowserRouter>
      <header style={{padding:20, borderBottom:'1px solid #eee'}}>
        <Link to="/" style={{marginRight:10}}>Home</Link>
        <Link to="/payment" style={{marginRight:10}}>Pay</Link>
        <Link to="/portfolio" style={{marginRight:10}}>Portfolio</Link>
        <Link to="/admin">Admin</Link>
      </header>
      <main style={{padding:20}}>
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/payment" element={<Payment/>} />
          <Route path="/portfolio" element={<Portfolio/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
