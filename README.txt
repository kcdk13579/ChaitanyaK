ChaitanyaK — Razorpay Test Integration (Persistent visitor counter)

Quick start (local):

1) Backend
   cd backend
   npm install
   cp .env.example .env
   # edit .env to add your MongoDB URI and Razorpay TEST keys
   npm run dev

2) Frontend
   cd frontend
   npx http-server -p 5500
   open http://localhost:5500

Test payment:
 - Click Pay ₹1, use test card 4111 1111 1111 1111
 - On success you will be redirected to portfolio.html
 - Visitor counts are persisted in backend/visitors.json and in MongoDB (visit records)

Admin stats:
 curl -H "x-admin-user: admin" -H "x-admin-pass: admin123" http://localhost:5000/admin/stats

Notes:
 - Replace RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env before deploying
 - Replace RAZORPAY_KEY placeholder in frontend/script.js with your test key id
 - This starter uses visitors.json for persistent counts; for production, use MongoDB queries or a dedicated analytics DB
