const BACKEND = 'http://localhost:5500';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const msg = document.getElementById('msg');

  msg.textContent = 'Logging in...';
  msg.style.color = 'black';

  try {
    const res = await fetch(`${BACKEND}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Invalid JSON response');
    }

    console.log('🔹 Server response:', data);

    if (res.ok && data.ok) {
      localStorage.setItem('adminToken', data.token);
      msg.textContent = '✅ Login successful! Redirecting...';
      msg.style.color = 'green';
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1200);
    } else {
      msg.textContent = data.error || '❌ Invalid credentials';
      msg.style.color = 'red';
    }
  } catch (err) {
    console.error('⚠️ Login error:', err);
    msg.textContent = 'Server not reachable. Check backend.';
    msg.style.color = 'red';
  }
});
