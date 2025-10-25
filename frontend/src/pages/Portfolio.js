import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_API_URL || "https://chaitanyak.onrender.com";

export default function Portfolio(){
  const [allowed, setAllowed] = useState(false);
  const [access, setAccess] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(()=> {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    axios.get(API + '/api/portfolio/check', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => {
        setAllowed(true);
        setAccess(r.data.access);
      }).catch(()=> setAllowed(false));

    axios.get(API + '/api/portfolio/count').then(r=> setCount(r.data.count)).catch(()=>{});
  }, []);

  if (!allowed) {
    return <div>
      <h3>Access required</h3>
      <p>You need to <a href="/payment">pay</a> to view this portfolio.</p>
    </div>;
  }

  return (
    <div>
      <h1>Portfolio content</h1>
      <p>Welcome {access?.name}. Your access expires at {new Date(access?.expiresAt).toString()}</p>
      <p>Total viewers: {count}</p>
      <section>
        <h2>About me</h2>
        <p>[Portfolio details go here — projects, contact, resume links...]</p>
      </section>
    </div>
  );
}
