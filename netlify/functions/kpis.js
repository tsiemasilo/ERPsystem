const { Pool } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'DATABASE_URL environment variable is not set'
        })
      };
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    const totalOrdersResult = await client.query('SELECT COUNT(*) as count FROM orders');
    const totalRevenueResult = await client.query('SELECT SUM(total_amount) as total FROM orders');
    const totalProductsResult = await client.query('SELECT COUNT(*) as count FROM products WHERE is_active = true');
    const totalCustomersResult = await client.query('SELECT COUNT(*) as count FROM customers');
    
    client.release();
    
    const kpis = {
      totalOrders: parseInt(totalOrdersResult.rows[0].count),
      totalRevenue: parseFloat(totalRevenueResult.rows[0].total || 0).toFixed(2),
      totalProducts: parseInt(totalProductsResult.rows[0].count),
      totalCustomers: parseInt(totalCustomersResult.rows[0].count)
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(kpis)
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Database connection failed',
        details: error.message
      })
    };
  }
};