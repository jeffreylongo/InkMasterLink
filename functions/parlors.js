// Netlify serverless function to handle API requests
const { Pool } = require('pg');

// Create PostgreSQL connection pool using environment variable from Netlify
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5,
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
    // Get the path and query parameters from the event
    const path = event.path.replace('/.netlify/functions/parlors', '');
    const pathSegments = path.split('/').filter(Boolean);
    const queryParams = event.queryStringParameters || {};
    const limit = queryParams.limit ? parseInt(queryParams.limit) : 10;
    const offset = queryParams.offset ? parseInt(queryParams.offset) : 0;
    
    console.log(`API Request: ${event.httpMethod} ${path} with params:`, queryParams);
    
    // Check if this is a specific parlor ID request
    if (pathSegments.length === 1 && !isNaN(parseInt(pathSegments[0]))) {
      const parlorId = parseInt(pathSegments[0]);
      
      const { rows } = await pool.query('SELECT * FROM parlors WHERE id = $1', [parlorId]);
      
      if (rows.length === 0) {
        return {
          statusCode: 404,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            success: false, 
            message: 'Shop not found' 
          })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(rows[0])
      };
    }
    
    // Featured parlors endpoint
    if (pathSegments.length === 1 && pathSegments[0] === 'featured') {
      const { rows } = await pool.query(
        'SELECT * FROM parlors WHERE featured = true ORDER BY rating DESC NULLS LAST LIMIT $1', 
        [limit]
      );
      
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
    
    // Random parlors endpoint
    if (pathSegments.length === 1 && pathSegments[0] === 'random') {
      const { rows } = await pool.query('SELECT * FROM parlors ORDER BY RANDOM() LIMIT $1', [limit]);
      
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
    
    // Artists endpoint
    if (path.startsWith('/artists')) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: true,
          message: "Coming Soon - Artists functionality is under development" 
        })
      };
    }
    
    // States endpoint for shop filtering
    if (pathSegments.length === 1 && pathSegments[0] === 'states') {
      const { rows } = await pool.query(
        `SELECT DISTINCT location->>'state' as state 
         FROM parlors 
         WHERE location->>'state' IS NOT NULL 
         ORDER BY state`
      );
      
      const states = rows.map(row => row.state);
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          count: states.length,
          data: states
        })
      };
    }
    
    // Get cities by state
    if (pathSegments.length === 2 && pathSegments[0] === 'cities') {
      const state = pathSegments[1];
      
      const { rows } = await pool.query(
        `SELECT DISTINCT location->>'city' as city 
         FROM parlors 
         WHERE location->>'state' = $1 AND location->>'city' IS NOT NULL 
         ORDER BY city`, 
        [state]
      );
      
      const cities = rows.map(row => row.city);
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          count: cities.length,
          data: cities
        })
      };
    }
    
    // Get parlors by state and/or city with search functionality
    if (queryParams.state || queryParams.city || queryParams.search || queryParams.rating) {
      let query = 'SELECT * FROM parlors WHERE 1=1';
      const params = [];
      let paramCount = 0;
      
      if (queryParams.state) {
        paramCount++;
        query += ` AND location->>'state' = $${paramCount}`;
        params.push(queryParams.state);
        console.log(`Filtering by state: ${queryParams.state}`);
      }
      
      if (queryParams.city) {
        paramCount++;
        query += ` AND location->>'city' = $${paramCount}`;
        params.push(queryParams.city);
        console.log(`Filtering by city: ${queryParams.city}`);
      }
      
      if (queryParams.search) {
        paramCount++;
        query += ` AND (name ILIKE $${paramCount} OR location->>'city' ILIKE $${paramCount} OR location->>'state' ILIKE $${paramCount})`;
        params.push(`%${queryParams.search}%`);
        console.log(`Searching for: ${queryParams.search}`);
      }
      
      if (queryParams.rating) {
        const minRating = parseInt(queryParams.rating) * 10; // Convert 1-5 to 10-50 scale
        paramCount++;
        query += ` AND rating >= $${paramCount}`;
        params.push(minRating);
        console.log(`Filtering by minimum rating: ${queryParams.rating} stars (${minRating})`);
      }
      
      query += ` ORDER BY rating DESC NULLS LAST LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);
      
      console.log(`Executing query: ${query} with params:`, params);
      
      const { rows } = await pool.query(query, params);
      
      console.log(`Found ${rows.length} shops matching filters`);
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          count: rows.length,
          data: rows,
          hasMore: rows.length === limit // Indicate if there might be more results
        })
      };
    }
    
    // Default to getting all parlors with pagination
    if (path === '' || path === '/') {
      const { rows } = await pool.query(
        'SELECT * FROM parlors ORDER BY rating DESC NULLS LAST LIMIT $1 OFFSET $2', 
        [limit, offset]
      );
      
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
        message: 'API endpoint not found' 
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        message: 'Internal Server Error', 
        error: error.toString() 
      })
    };
  }
};