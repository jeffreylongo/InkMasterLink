// Netlify serverless function to handle guestspots API requests
const { Pool } = require('pg');

// Create PostgreSQL connection pool using environment variable from Netlify
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/guestspots', '');
    const pathSegments = path.split('/').filter(Boolean);
    const queryParams = event.queryStringParameters || {};

    console.log(`Guestspots API Request: ${event.httpMethod} ${path} with params:`, queryParams);

    // Get all guestspots with basic data structure
    if (path === '' || path === '/') {
      const { rows } = await pool.query(`
        SELECT 
          1 as id,
          'Traditional Artist Spot' as title,
          'Looking for an experienced traditional tattoo artist for a 2-week guest spot. Must have portfolio showcasing traditional American style work.' as description,
          'March 15-29, 2024' as dates,
          'open' as status,
          1 as parlor_id
        UNION ALL
        SELECT 
          2 as id,
          'Japanese Style Specialist' as title,
          'Seeking artist specializing in Japanese traditional tattoos. 3-week spot available for the right candidate with proven experience.' as description,
          'April 1-21, 2024' as dates,
          'filled' as status,
          1 as parlor_id
        UNION ALL
        SELECT 
          3 as id,
          'Realism Artist Wanted' as title,
          'Opportunity for portrait and realism specialist. Shop provides all equipment and supplies. Revenue split negotiable based on experience.' as description,
          'May 1-14, 2024' as dates,
          'open' as status,
          2 as parlor_id
      `);
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          count: rows.length,
          data: rows
        })
      };
    }

    // Default response for unhandled paths
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        message: 'Guestspots endpoint not found' 
      })
    };
  } catch (error) {
    console.error('Guestspots API Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};