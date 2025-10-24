const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const app = require('./app'); // 👈 import Express app

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
