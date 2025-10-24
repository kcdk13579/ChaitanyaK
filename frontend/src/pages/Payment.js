import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://chaitanyak.onrender.com/api";// backend URL

export default function Payment() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Razorpay SDK once
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => console.log('✅ Razorpay SDK loaded');
      script.onerror = () => alert('❌ Failed to load Razorpay SDK');
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function startPayment(e) {
    e.preventDefault();
    console.log('🟢 Starting payment...');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/payment/create-order`, form);
      console.log('🧾 Order response:', data);

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Portfolio Access',
        description: 'Access Portfolio for 24 hours',
        order_id: data.orderId,
        handler: async function (response) {
          console.log('💰 Payment success:', response);
          const verifyRes = await axios.post(`${API}/api/payment/verify`, {
            ...response,
            ...form
          });
          if (verifyRes.data.ok) {
            alert('✅ Payment verified successfully!');
            localStorage.setItem('accessToken', verifyRes.data.token);
            window.location.href = '/portfolio';
          } else {
            alert('❌ Verification failed');
          }
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#3399cc' },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay SDK not loaded');
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      alert('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
      <h2>Pay ₹100 to Unlock Portfolio</h2>
      <form onSubmit={startPayment}>
        <label>Name *</label><br />
        <input name="name" value={form.name} onChange={handleChange} required /><br /><br />
        <label>Email</label><br />
        <input name="email" value={form.email} onChange={handleChange} /><br /><br />
        <label>Phone</label><br />
        <input name="phone" value={form.phone} onChange={handleChange} /><br /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Pay ₹100 (test)'}
        </button>
      </form>
    </div>
  );
}
