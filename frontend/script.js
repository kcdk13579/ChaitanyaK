const BACKEND = 'https://chaitanyak.onrender.com';
const RAZORPAY_KEY =rzp_test_RWqtiLLs48Sv8Z; // replace with your test key id

document.getElementById('payBtn').addEventListener('click', async () => {
  try {
    document.getElementById('status').innerText = 'Creating order...';
    const res = await fetch(BACKEND + '/api/payment/create-order', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
  name: "Chaitanya",
  email: "chaitanya@example.com",
  phone: "9999999999",
  amount
})

    });
    const { order } = await res.json();
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'Chaitanya Kayala',
      description: '₹1 to view portfolio (10 minutes)',
      order_id: order.id,
      handler: async function(response) {
        const verifyRes = await fetch(BACKEND + '/api/payment/verify', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: order.amount,
            plan: 'portfolio_view'
          })
        });
        const data = await verifyRes.json();
        if (data.success) {
          const accessData = { token: data.token, time: Date.now() };
          localStorage.setItem('accessData', JSON.stringify(accessData));
          window.location.href = 'portfolio.html';
        } else alert('Payment verification failed');
      }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    alert('Failed to start payment');
  }
});
