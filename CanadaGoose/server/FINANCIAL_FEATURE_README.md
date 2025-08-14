# Financial Transactions Feature

This document describes the implementation of the financial transactions feature for the CanadaGoose application.

## Overview

The financial transactions feature allows users to:

- Submit income and expenditure transactions
- Categorize transactions by type and subtype
- Support multiple currencies (USD/CAD)
- Add descriptions and dates to transactions
- View transaction history and summaries

## Database Schema

### Table: `financial_transactions`

| Column             | Type          | Constraints                         | Description                   |
| ------------------ | ------------- | ----------------------------------- | ----------------------------- |
| `id`               | INT           | AUTO_INCREMENT, PRIMARY KEY         | Unique transaction identifier |
| `user_id`          | INT           | NOT NULL, FOREIGN KEY               | Reference to users table      |
| `type`             | ENUM          | 'income' or 'expenditure'           | Transaction type              |
| `subtype`          | VARCHAR(50)   | NOT NULL                            | Transaction category          |
| `amount`           | DECIMAL(10,2) | NOT NULL, > 0                       | Transaction amount            |
| `currency`         | ENUM          | 'USD' or 'CAD', DEFAULT 'USD'       | Currency type                 |
| `transaction_date` | DATE          | NOT NULL                            | Date of transaction           |
| `description`      | TEXT          | Optional                            | Transaction notes             |
| `created_at`       | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP           | Record creation time          |
| `updated_at`       | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time              |

### Valid Subtypes

**Income:**

- salary
- bonus
- investment
- freelance
- other

**Expenditure:**

- grocery
- transportation
- gift
- entertainment
- utilities
- rent
- other

### Indexes

- `idx_user_id` - User transactions lookup
- `idx_type` - Transaction type filtering
- `idx_subtype` - Subtype filtering
- `idx_transaction_date` - Date-based queries
- `idx_currency` - Currency filtering
- `idx_user_date` - Composite index for user + date queries

## API Endpoints

### 1. Submit Transaction

**POST** `/api/financial/submit`

Submit a new financial transaction.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "type": "income|expenditure",
  "subtype": "string",
  "amount": "number > 0",
  "currency": "USD|CAD",
  "transaction_date": "YYYY-MM-DD",
  "description": "string (optional)"
}
```

**Response (201):**

```json
{
  "message": "Financial transaction submitted successfully",
  "transaction": {
    "id": 1,
    "type": "income",
    "subtype": "salary",
    "amount": 5000.0,
    "currency": "USD",
    "transaction_date": "2024-01-15",
    "description": "Monthly salary payment",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2. Get Transactions

**GET** `/api/financial/transactions`

Retrieve user's financial transactions with filtering and pagination.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

- `type` (optional): Filter by transaction type
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `limit` (optional): Number of records per page (default: 50)
- `offset` (optional): Number of records to skip (default: 0)

**Response (200):**

```json
{
  "transactions": [...],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 3. Get Summary

**GET** `/api/financial/summary`

Get financial summary and statistics.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)

**Response (200):**

```json
{
  "summary": [
    {
      "type": "income",
      "total_amount": 6000.0,
      "currency": "USD",
      "transaction_count": 2
    }
  ],
  "topCategories": [
    {
      "type": "income",
      "subtype": "salary",
      "total_amount": 5000.0,
      "currency": "USD",
      "transaction_count": 1
    }
  ]
}
```

## Validation Rules

### Type Validation

- Must be either 'income' or 'expenditure'
- Case-sensitive

### Subtype Validation

- Must be valid for the selected type
- Predefined list of allowed values

### Amount Validation

- Must be a positive number
- Supports decimal values up to 2 places
- Maximum value: 99999999.99

### Currency Validation

- Must be either 'USD' or 'CAD'
- Case-sensitive

### Date Validation

- Must be in YYYY-MM-DD format
- Cannot be a future date
- Must be a valid calendar date

### Description Validation

- Optional field
- Maximum length: 65,535 characters
- Trims whitespace

## Error Handling

### HTTP Status Codes

- **200** - Success (GET requests)
- **201** - Created (POST requests)
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing/invalid token)
- **500** - Internal Server Error

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Human-readable error description"
}
```

### Common Error Types

- `Missing required fields`
- `Invalid type`
- `Invalid subtype`
- `Invalid amount`
- `Invalid currency`
- `Invalid date format`
- `Invalid date`

## Security Features

- **Authentication Required**: All endpoints require valid JWT token
- **User Isolation**: Users can only access their own transactions
- **Input Validation**: Comprehensive validation of all input data
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Inherits from global API rate limiting

## Testing

### Running Tests

```bash
# From the server directory
./scripts/test-financial.sh
```

### Test Coverage

The test suite covers:

- ✅ Transaction submission (valid and invalid data)
- ✅ Data validation rules
- ✅ Authentication requirements
- ✅ Transaction retrieval and filtering
- ✅ Summary and statistics
- ✅ Database constraints
- ✅ Error handling

### Test Database

Tests use a separate test database to avoid affecting production data. The test runner automatically:

- Creates test users
- Sets up test data
- Cleans up after tests complete

## Migration

### Running Migration

```bash
# From the server directory
./scripts/migrate-financial-table.sh
```

### Migration Features

- Automatically creates the `financial_transactions` table
- Adds all required indexes
- Inserts sample data for testing
- Handles existing table gracefully
- Provides detailed feedback

## Usage Examples

### Submit Income Transaction

```bash
curl -X POST http://localhost:3000/api/financial/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "subtype": "salary",
    "amount": 5000.00,
    "currency": "USD",
    "transaction_date": "2024-01-15",
    "description": "Monthly salary payment"
  }'
```

### Submit Expenditure Transaction

```bash
curl -X POST http://localhost:3000/api/financial/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expenditure",
    "subtype": "grocery",
    "amount": 150.75,
    "currency": "CAD",
    "transaction_date": "2024-01-16",
    "description": "Weekly grocery shopping"
  }'
```

### Get User Transactions

```bash
curl -X GET "http://localhost:3000/api/financial/transactions?type=income&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Performance Considerations

- **Indexed Queries**: All common query patterns are indexed
- **Pagination**: Large result sets are paginated
- **Connection Pooling**: Uses database connection pooling
- **Query Optimization**: Efficient SQL queries with proper JOINs

## Monitoring and Logging

- **Request Logging**: All API requests are logged
- **Error Logging**: Detailed error logging with context
- **Performance Monitoring**: Request timing and performance metrics
- **Security Logging**: Authentication and authorization events

## Future Enhancements

Potential improvements for future versions:

- Multi-currency conversion
- Recurring transactions
- Budget tracking
- Export functionality (CSV, PDF)
- Advanced analytics and reporting
- Mobile app integration
- Webhook notifications

## Troubleshooting

### Common Issues

1. **Table not found**: Run the migration script
2. **Authentication errors**: Check JWT token validity
3. **Validation errors**: Verify request body format
4. **Database connection**: Ensure MySQL is running

### Debug Mode

Enable debug logging by setting:

```bash
export DEBUG=financial:*
```

## Support

For issues or questions about the financial transactions feature:

1. Check the test suite for examples
2. Review the validation rules
3. Check server logs for detailed error messages
4. Verify database connectivity and table structure
