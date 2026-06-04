const express = require('express');
const Transaction = require('../models/transaction');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

function monthKey(dateStr) {
  return String(dateStr || '').slice(0, 7); // YYYY-MM
}

router.get('/monthly', async (req, res) => {
  try {
    const userId = req.userId;
    const { month } = req.query; // YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'Provide month as YYYY-MM' });

    const docs = await Transaction.find({ userId, date: { $regex: `^${month}-` } });

    let income = 0;
    let expense = 0;

    const incomeByCat = new Map();
    const expenseByCat = new Map();

    for (const d of docs) {
      const amt = Number(d.amount) || 0;
      if (d.type === 'income') {
        income += amt;
        const key = d.category || 'Uncategorized';
        incomeByCat.set(key, (incomeByCat.get(key) || 0) + amt);
      } else {
        expense += amt;
        const key = d.category || 'Uncategorized';
        expenseByCat.set(key, (expenseByCat.get(key) || 0) + amt);
      }
    }

    const net = income - expense;

    const toSortedArr = (map) =>
      Array.from(map.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

    return res.json({
      month,
      totals: { income, expense, net },
      incomeByCategory: toSortedArr(incomeByCat),
      expenseByCategory: toSortedArr(expenseByCat),
      transactionCount: docs.length,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to compute report' });
  }
});

module.exports = router;

