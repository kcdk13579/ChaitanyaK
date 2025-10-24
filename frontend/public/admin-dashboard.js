const BACKEND = 'http://localhost:5500';
const token = localStorage.getItem('adminToken');
const msg = document.getElementById('msg');

// ✅ Redirect to login if no token
if (!token) {
  window.location.href = 'admin-login.html';
}

// ✅ Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  window.location.href = 'admin-login.html';
});

// ✅ Load stats + payments
async function loadDashboard() {
  try {
    msg.textContent = "Loading dashboard data...";

    // Fetch stats
    const statsRes = await fetch(`${BACKEND}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const statsData = await statsRes.json();
    if (!statsRes.ok) throw new Error(statsData.error || "Stats fetch failed");

    document.getElementById('totalPayments').textContent = statsData.totalPayments;
    document.getElementById('totalRevenue').textContent = (statsData.totalRevenue / 100).toFixed(2); // assuming paise

    // Fetch payments
    const payRes = await fetch(`${BACKEND}/api/admin/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const payData = await payRes.json();
    if (!payRes.ok) throw new Error(payData.error || "Payments fetch failed");

    const tbody = document.querySelector('#paymentsTable tbody');
    tbody.innerHTML = "";

    payData.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.userName || 'N/A'}</td>
        <td>₹${(p.amount / 100).toFixed(2)}</td>
        <td>${p.status}</td>
        <td>${new Date(p.createdAt).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });

    msg.textContent = "";
  } catch (err) {
    console.error('Dashboard load error:', err);
    msg.textContent = "⚠️ Failed to load dashboard data. Please re-login.";
  }
}

loadDashboard();
