const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration for production RDS
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'webapp_user',
  password: process.env.DB_PASSWORD || 'your-db-password-here',
  database: process.env.DB_NAME || 'webapp_db',

  // Connection pool settings for production
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS !== 'false',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,

  // MySQL2 specific settings (only use supported options)
  connectTimeout: 60000, // 60 seconds

  // SSL configuration for RDS
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,

  // Character set and collation
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',

  // Multiple statements (disabled for security)
  multipleStatements: false,

  // Date handling
  dateStrings: true,
  timezone: 'Z', // Use 'Z' instead of 'UTC' for MySQL2
};

// Create connection pool
let pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ Database pool created successfully');
} catch (error) {
  console.error('❌ Failed to create database pool:', error.message);
  process.exit(1);
}

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);

    // Test a simple query
    const [rows] = await connection.execute(
      'SELECT 1 as test, NOW() as timestamp'
    );
    console.log('   Test query result:', rows[0]);

    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error number:', error.errno);

    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      console.error(
        '   💡 Check if the RDS instance is running and accessible'
      );
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   💡 Check your database username and password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   💡 Check if the database exists');
    }

    return false;
  }
};

// Query helper function with better error handling
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', {
      sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
      params: params,
      error: error.message,
      code: error.code,
    });
    throw error;
  }
};

// Transaction helper function
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Health check function
const healthCheck = async () => {
  try {
    const [rows] = await pool.execute('SELECT 1 as status, NOW() as timestamp');
    return {
      status: 'healthy',
      timestamp: rows[0].timestamp,
      connectionCount: pool.pool.length,
      idleCount: pool.pool.length - pool.pool.used,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Graceful shutdown
const closePool = async () => {
  if (pool) {
    console.log('🔄 Closing database pool...');
    await pool.end();
    console.log('✅ Database pool closed successfully');
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🔄 Received SIGINT, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  healthCheck,
  closePool,
  dbConfig: {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
  },
};
