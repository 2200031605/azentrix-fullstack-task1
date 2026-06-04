const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);

