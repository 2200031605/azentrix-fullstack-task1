const express = require('express');
const Transaction = require('../models/transaction');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// All routes below require auth
router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { month } = req.query; // YYYY-MM

    const where = { userId };
    const filter = month ? { date: { $regex: `^${month}-` } } : {};

    const docs = await Transaction.find({ ...where, ...filter }).sort({ date: -1, createdAt: -1 });
    return res.json({ data: docs });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { type, amount, category, date, notes } = req.body || {};

    if (!type || (type !== 'income' && type !== 'expense')) return res.status(400).json({ error: 'Invalid type' });
    if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: 'Invalid amount' });
    if (!category || !String(category).trim()) return res.status(400).json({ error: 'Missing category' });
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Invalid date (YYYY-MM-DD)' });

    const doc = await Transaction.create({
      userId,
      type,
      amount,
      category: String(category).trim(),
      date,
      notes: notes ? String(notes).trim() : '',
    });

    return res.json({ data: doc });
  } catch {
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { type, amount, category, date, notes } = req.body || {};

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      {
        type: type || undefined,
        amount: amount === undefined ? undefined : amount,
        category: category ? String(category).trim() : undefined,
        date,
        notes: notes !== undefined ? String(notes).trim() : '',
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.json({ data: updated });
  } catch {
    return res.status(500).json({ error: 'Failed to update transaction' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deleted = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;

