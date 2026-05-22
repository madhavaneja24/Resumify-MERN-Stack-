const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length);

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://resumify-mern-stack.vercel.app',
    'https://resumify-mern-stack-git-main-madhavs-projects-e5177c51.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/ats', require('./routes/ats'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server running!'
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
