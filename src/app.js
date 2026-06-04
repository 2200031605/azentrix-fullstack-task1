
const express = require('express');
const path = require('path');
const cors = require('cors');

const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const { connectDB } = require('./db/mongoose');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- MongoDB ---
connectDB().catch((e) => {
  console.error('MongoDB connection failed:', e?.message || e);
});

// --- Product-like API ---
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// --- Personal Budget Tracker frontend (static) ---
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => {
  // Ensure `/` shows the premium fintech dashboard
  res.redirect('/dashboard.html');
});


// --- Existing expense-sharing backend routes ---
app.use('/groups', groupRoutes);
app.use('/expenses', expenseRoutes);

module.exports = app;



