const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');
const { logger } = require('../config/logger');

const router = express.Router();

// Validation middleware for financial transaction data
const validateFinancialData = (req, res, next) => {
  const { type, subtype, amount, currency, transaction_date, description } =
    req.body;

  // Check required fields
  if (!type || !subtype || !amount || !currency || !transaction_date) {
    return res.status(400).json({
      error: 'Missing required fields',
      message:
        'Type, subtype, amount, currency, and transaction_date are required',
    });
  }

  // Validate type
  if (!['income', 'expenditure'].includes(type)) {
    return res.status(400).json({
      error: 'Invalid type',
      message: 'Type must be either "income" or "expenditure"',
    });
  }

  // Validate subtype based on type
  const validSubtypes = {
    income: ['salary', 'bonus', 'investment', 'freelance', 'other'],
    expenditure: [
      'grocery',
      'transportation',
      'gift',
      'entertainment',
      'utilities',
      'rent',
      'other',
    ],
  };

  if (!validSubtypes[type].includes(subtype)) {
    return res.status(400).json({
      error: 'Invalid subtype',
      message: `Subtype for ${type} must be one of: ${validSubtypes[type].join(
        ', '
      )}`,
    });
  }

  // Validate amount
  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      error: 'Invalid amount',
      message: 'Amount must be a positive number',
    });
  }

  // Validate currency
  if (!['USD', 'CAD'].includes(currency)) {
    return res.status(400).json({
      error: 'Invalid currency',
      message: 'Currency must be either "USD" or "CAD"',
    });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(transaction_date)) {
    return res.status(400).json({
      error: 'Invalid date format',
      message: 'Date must be in YYYY-MM-DD format',
    });
  }

  // Validate date is not in the future
  const inputDate = new Date(transaction_date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  if (inputDate > today) {
    return res.status(400).json({
      error: 'Invalid date',
      message: 'Transaction date cannot be in the future',
    });
  }

  next();
};

// Submit financial transaction endpoint
router.post(
  '/submit',
  authenticateToken,
  validateFinancialData,
  async (req, res) => {
    try {
      const { type, subtype, amount, currency, transaction_date, description } =
        req.body;
      const userId = req.user.userId;

      logger.info('Financial transaction submission', {
        userId,
        type,
        subtype,
        amount,
        currency,
        transaction_date,
      });

      // Insert transaction into database
      const result = await query(
        `INSERT INTO financial_transactions 
       (user_id, type, subtype, amount, currency, transaction_date, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          type,
          subtype,
          parseFloat(amount),
          currency,
          transaction_date,
          description || '',
        ]
      );

      // Fetch the inserted transaction for response
      const [insertedTransaction] = await query(
        'SELECT * FROM financial_transactions WHERE id = ?',
        [result.insertId]
      );

      logger.info('Financial transaction created successfully', {
        transactionId: result.insertId,
        userId,
      });

      res.status(201).json({
        message: 'Financial transaction submitted successfully',
        transaction: {
          id: insertedTransaction.id,
          type: insertedTransaction.type,
          subtype: insertedTransaction.subtype,
          amount: insertedTransaction.amount,
          currency: insertedTransaction.currency,
          transaction_date: insertedTransaction.transaction_date,
          description: insertedTransaction.description,
          created_at: insertedTransaction.created_at,
        },
      });
    } catch (error) {
      logger.error('Error submitting financial transaction', {
        error: error.message,
        userId: req.user?.userId,
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to submit financial transaction',
      });
    }
  }
);

// Get user's financial transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, start_date, end_date, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT * FROM financial_transactions WHERE user_id = ?';
    const params = [userId];

    // Add filters if provided
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (start_date) {
      sql += ' AND transaction_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND transaction_date <= ?';
      params.push(end_date);
    }

    // Add ordering and pagination
    sql += ' ORDER BY transaction_date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = await query(sql, params);

    // Get total count for pagination
    let countSql =
      'SELECT COUNT(*) as total FROM financial_transactions WHERE user_id = ?';
    const countParams = [userId];

    if (type) {
      countSql += ' AND type = ?';
      countParams.push(type);
    }

    if (start_date) {
      countSql += ' AND transaction_date >= ?';
      countParams.push(start_date);
    }

    if (end_date) {
      countSql += ' AND transaction_date <= ?';
      countParams.push(end_date);
    }

    const [countResult] = await query(countSql, countParams);
    const total = countResult.total;

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + transactions.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching financial transactions', {
      error: error.message,
      userId: req.user?.userId,
    });

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial transactions',
    });
  }
});

// Get transaction summary/statistics
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [userId];

    if (start_date && end_date) {
      dateFilter = 'AND transaction_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    // Get income and expenditure totals
    const summarySql = `
      SELECT 
        type,
        SUM(amount) as total_amount,
        currency,
        COUNT(*) as transaction_count
      FROM financial_transactions 
      WHERE user_id = ? ${dateFilter}
      GROUP BY type, currency
      ORDER BY type, currency
    `;

    const summary = await query(summarySql, params);

    // Get top categories
    const topCategoriesSql = `
      SELECT 
        type,
        subtype,
        SUM(amount) as total_amount,
        currency,
        COUNT(*) as transaction_count
      FROM financial_transactions 
      WHERE user_id = ? ${dateFilter}
      GROUP BY type, subtype, currency
      ORDER BY total_amount DESC
      LIMIT 10
    `;

    const topCategories = await query(topCategoriesSql, params);

    res.json({
      summary,
      topCategories,
    });
  } catch (error) {
    logger.error('Error fetching financial summary', {
      error: error.message,
      userId: req.user?.userId,
    });

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial summary',
    });
  }
});

module.exports = router;
