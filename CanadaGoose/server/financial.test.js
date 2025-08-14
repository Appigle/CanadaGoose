const request = require('supertest');
const app = require('./app');
const { query } = require('./config/database');
const { expect } = require('chai');

describe('Financial Transactions API', () => {
  let authToken;
  let testUserId;

  // Setup: Create a test user and get auth token
  before(async () => {
    try {
      // Create a test user
      const testUser = {
        username: 'financialtestuser',
        email: 'financialtest@example.com',
        password: 'TestPass123!',
      };

      // First try to create user
      const signupResponse = await request(app)
        .post('/api/signup')
        .send(testUser);

      if (signupResponse.status === 201) {
        authToken = signupResponse.body.token;
        testUserId = signupResponse.body.user.id;
      } else {
        // User might already exist, try to login
        const loginResponse = await request(app).post('/api/login').send({
          email: testUser.email,
          password: testUser.password,
        });

        authToken = loginResponse.body.token;
        testUserId = loginResponse.body.user.id;
      }

      // Clean up any existing test data
      await query('DELETE FROM financial_transactions WHERE user_id = ?', [
        testUserId,
      ]);
    } catch (error) {
      console.error('Setup failed:', error);
    }
  });

  // Cleanup: Remove test data
  after(async () => {
    try {
      if (testUserId) {
        await query('DELETE FROM financial_transactions WHERE user_id = ?', [
          testUserId,
        ]);
        await query('DELETE FROM users WHERE id = ?', [testUserId]);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  describe('POST /api/financial/submit', () => {
    it('should submit a valid income transaction', async () => {
      const transactionData = {
        type: 'income',
        subtype: 'salary',
        amount: 5000.0,
        currency: 'USD',
        transaction_date: '2024-01-15',
        description: 'Monthly salary payment',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(201);
      expect(response.body.message).to.equal(
        'Financial transaction submitted successfully'
      );
      expect(response.body.transaction).to.include({
        type: transactionData.type,
        subtype: transactionData.subtype,
        amount: transactionData.amount,
        currency: transactionData.currency,
        transaction_date: transactionData.transaction_date,
        description: transactionData.description,
      });
      expect(response.body.transaction.id).to.exist;
      expect(response.body.transaction.created_at).to.exist;
    });

    it('should submit a valid expenditure transaction', async () => {
      const transactionData = {
        type: 'expenditure',
        subtype: 'grocery',
        amount: 150.75,
        currency: 'CAD',
        transaction_date: '2024-01-16',
        description: 'Weekly grocery shopping',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(201);
      expect(response.body.transaction).to.include({
        type: transactionData.type,
        subtype: transactionData.subtype,
        amount: transactionData.amount,
        currency: transactionData.currency,
        transaction_date: transactionData.transaction_date,
        description: transactionData.description,
      });
    });

    it('should reject transaction without authentication', async () => {
      const transactionData = {
        type: 'income',
        subtype: 'bonus',
        amount: 1000.0,
        currency: 'USD',
        transaction_date: '2024-01-17',
        description: 'Performance bonus',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .send(transactionData);

      expect(response.status).to.equal(401);
    });

    it('should reject transaction with invalid type', async () => {
      const transactionData = {
        type: 'invalid_type',
        subtype: 'salary',
        amount: 1000.0,
        currency: 'USD',
        transaction_date: '2024-01-17',
        description: 'Test transaction',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Invalid type');
    });

    it('should reject transaction with invalid subtype for income', async () => {
      const transactionData = {
        type: 'income',
        subtype: 'grocery', // Invalid for income
        amount: 1000.0,
        currency: 'USD',
        transaction_date: '2024-01-17',
        description: 'Test transaction',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Invalid subtype');
    });

    it('should reject transaction with invalid subtype for expenditure', async () => {
      const transactionData = {
        type: 'expenditure',
        subtype: 'salary', // Invalid for expenditure
        amount: 1000.0,
        currency: 'USD',
        transaction_date: '2024-01-17',
        description: 'Test transaction',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Invalid subtype');
    });

    it('should reject transaction with negative amount', async () => {
      const transactionData = {
        type: 'income',
        subtype: 'salary',
        amount: -1000.0,
        currency: 'USD',
        transaction_date: '2024-01-17',
        description: 'Test transaction',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Invalid amount');
    });

    it('should reject transaction with invalid currency', async () => {
      const transactionData = {
        type: 'income',
        subtype: 'salary',
        amount: 1000.0,
        currency: 'EUR', // Invalid currency
        transaction_date: '2024-01-17',
        description: 'Test transaction',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Invalid currency');
    });

    it('should reject transaction with invalid date format', async () => {
      const transactionData = {
        type: 'income',
        subtype: 'salary',
        amount: 1000.0,
        currency: 'USD',
        transaction_date: '2024/01/17', // Invalid format
        description: 'Test transaction',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Invalid date format');
    });

    it('should reject transaction with future date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const transactionData = {
        type: 'income',
        subtype: 'salary',
        amount: 1000.0,
        currency: 'USD',
        transaction_date: futureDate,
        description: 'Test transaction',
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Invalid date');
    });

    it('should accept transaction without description', async () => {
      const transactionData = {
        type: 'income',
        subtype: 'bonus',
        amount: 500.0,
        currency: 'USD',
        transaction_date: '2024-01-18',
        // No description
      };

      const response = await request(app)
        .post('/api/financial/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).to.equal(201);
      expect(response.body.transaction.description).to.equal('');
    });
  });

  describe('GET /api/financial/transactions', () => {
    beforeEach(async () => {
      // Insert some test transactions
      const testTransactions = [
        {
          type: 'income',
          subtype: 'salary',
          amount: 5000.0,
          currency: 'USD',
          transaction_date: '2024-01-15',
          description: 'Monthly salary',
        },
        {
          type: 'expenditure',
          subtype: 'grocery',
          amount: 150.75,
          currency: 'USD',
          transaction_date: '2024-01-16',
          description: 'Weekly grocery',
        },
        {
          type: 'income',
          subtype: 'bonus',
          amount: 1000.0,
          currency: 'CAD',
          transaction_date: '2024-01-17',
          description: 'Performance bonus',
        },
      ];

      for (const transaction of testTransactions) {
        await query(
          `INSERT INTO financial_transactions 
           (user_id, type, subtype, amount, currency, transaction_date, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            testUserId,
            transaction.type,
            transaction.subtype,
            transaction.amount,
            transaction.currency,
            transaction.transaction_date,
            transaction.description,
          ]
        );
      }
    });

    it('should fetch all transactions for authenticated user', async () => {
      const response = await request(app)
        .get('/api/financial/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.transactions).to.exist;
      expect(response.body.pagination).to.exist;
      expect(response.body.transactions.length).to.be.greaterThan(0);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/financial/transactions?type=income')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.transactions.every((t) => t.type === 'income')).to.be
        .true;
    });

    it('should filter transactions by date range', async () => {
      const response = await request(app)
        .get(
          '/api/financial/transactions?start_date=2024-01-15&end_date=2024-01-16'
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(
        response.body.transactions.every(
          (t) =>
            t.transaction_date >= '2024-01-15' &&
            t.transaction_date <= '2024-01-16'
        )
      ).to.be.true;
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/financial/transactions?limit=2&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.transactions.length).to.be.lessThanOrEqual(2);
      expect(response.body.pagination.limit).to.equal(2);
      expect(response.body.pagination.offset).to.equal(0);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app).get('/api/financial/transactions');

      expect(response.status).to.equal(401);
    });
  });

  describe('GET /api/financial/summary', () => {
    it('should fetch financial summary for authenticated user', async () => {
      const response = await request(app)
        .get('/api/financial/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.summary).to.exist;
      expect(response.body.topCategories).to.exist;
    });

    it('should filter summary by date range', async () => {
      const response = await request(app)
        .get('/api/financial/summary?start_date=2024-01-15&end_date=2024-01-17')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.summary).to.exist;
    });

    it('should reject request without authentication', async () => {
      const response = await request(app).get('/api/financial/summary');

      expect(response.status).to.equal(401);
    });
  });

  describe('Database Constraints', () => {
    it('should enforce foreign key constraint', async () => {
      const invalidUserId = 99999; // Non-existent user ID

      try {
        await query(
          `INSERT INTO financial_transactions 
           (user_id, type, subtype, amount, currency, transaction_date, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            invalidUserId,
            'income',
            'salary',
            1000.0,
            'USD',
            '2024-01-20',
            'Test',
          ]
        );
        // If we reach here, the constraint failed
        expect(true).to.be.false;
      } catch (error) {
        expect(error.code).to.equal('ER_NO_REFERENCED_ROW_2');
      }
    });

    it('should enforce enum constraints', async () => {
      try {
        await query(
          `INSERT INTO financial_transactions 
           (user_id, type, subtype, amount, currency, transaction_date, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            testUserId,
            'invalid_type',
            'salary',
            1000.0,
            'USD',
            '2024-01-20',
            'Test',
          ]
        );
        expect(true).to.be.false;
      } catch (error) {
        expect(error.code).to.equal('ER_INVALID_ENUM_VALUE');
      }
    });
  });
});
