const { Pool } = require('@neondatabase/serverless');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard KPIs endpoint
app.get('/api/dashboard/kpis', async (req, res) => {
  try {
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
    
    res.json(kpis);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Export for Netlify
exports.handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters, body, headers } = event;
  
  return new Promise((resolve, reject) => {
    const req = {
      method: httpMethod,
      url: path,
      query: queryStringParameters || {},
      headers: headers || {},
      body: body ? JSON.parse(body) : {}
    };
    
    let responseData = '';
    let statusCode = 200;
    let responseHeaders = {};
    
    const res = {
      statusCode: 200,
      setHeader: (key, value) => {
        responseHeaders[key] = value;
      },
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseHeaders['Content-Type'] = 'application/json';
        responseData = JSON.stringify(data);
        resolve({
          statusCode,
          headers: responseHeaders,
          body: responseData
        });
      },
      send: (data) => {
        responseData = data;
        resolve({
          statusCode,
          headers: responseHeaders,
          body: responseData
        });
      },
      end: (data) => {
        responseData = data || '';
        resolve({
          statusCode,
          headers: responseHeaders,
          body: responseData
        });
      }
    };
    
    // Handle the request
    if (path === '/api/test') {
      res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
    } else if (path === '/api/dashboard/kpis') {
      // Handle KPIs request
      handleKpis(req, res);
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  });
};

async function handleKpis(req, res) {
  try {
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
    
    res.json(kpis);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}