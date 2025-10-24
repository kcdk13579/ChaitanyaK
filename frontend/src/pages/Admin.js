import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Admin(){
  const [stats, setStats] = useState(null);
  useEffect(()=> {
    axios.get(API + '/api/admin/stats').then(r=> setStats(r.data)).catch(e=> console.error(e));
  }, []);
  if (!stats) return <div>Loading...</div>;
  return (
    <div>
      <h1>Admin Dashboard (Demo)</h1>
      <ul>
        <li>Total users: {stats.totalUsers}</li>
        <li>Active: {stats.active}</li>
        <li>Expired: {stats.expired}</li>
        <li>Payments: {stats.payments}</li>
        <li>Captured: {stats.captured}</li>
        <li>Failed: {stats.failed}</li>
      </ul>
    </div>
  );
}
