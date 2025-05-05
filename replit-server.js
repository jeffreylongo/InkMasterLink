const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
// Determine the backend URL - use localhost by default, but could be customized
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API-specific routes for easy tracking and debugging
app.get('/api/artists', (req, res) => {
  console.log('Handling specific artists endpoint');
  axios.get(`${BACKEND_URL}/api/artists`)
    .then(response => {
      console.log('Successfully fetched artists from backend');
      res.json(response.data);
    })
    .catch(error => {
      console.error(`Error fetching artists: ${error.message}`);
      res.status(500).json({ 
        error: 'Failed to fetch artists from backend',
        details: error.message 
      });
    });
});

app.get('/api/parlors', (req, res) => {
  console.log('Handling specific parlors endpoint');
  axios.get(`${BACKEND_URL}/api/parlors`)
    .then(response => {
      console.log('Successfully fetched parlors from backend');
      res.json(response.data);
    })
    .catch(error => {
      console.error(`Error fetching parlors: ${error.message}`);
      res.status(500).json({ 
        error: 'Failed to fetch parlors from backend',
        details: error.message 
      });
    });
});

// Forward shops to parlors internally
app.get('/api/shops', (req, res) => {
  console.log('Forwarding shops request to parlors endpoint');
  axios.get(`${BACKEND_URL}/api/parlors`)
    .then(response => {
      console.log('Successfully fetched shops (parlors) from backend');
      res.json(response.data);
    })
    .catch(error => {
      console.error(`Error fetching shops: ${error.message}`);
      res.status(500).json({ 
        error: 'Failed to fetch shops from backend',
        details: error.message 
      });
    });
});

// Generic API proxy for other endpoints
app.use('/api', (req, res) => {
  // Skip endpoints we've already defined
  if (req.path === '/artists' || req.path === '/parlors' || req.path === '/shops') {
    return;
  }
  
  // Handle other API routes
  const path = req.url;
  const backendUrl = `${BACKEND_URL}/api${path}`;
  console.log(`Proxying generic API request to: ${backendUrl}`);
  
  axios({
    method: req.method,
    url: backendUrl,
    data: req.body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log(`Success response from backend: ${req.url}`);
      res.status(response.status).json(response.data);
    })
    .catch(error => {
      console.error(`Error proxying request to ${backendUrl}: ${error.message}`);
      res.status(error.response?.status || 500).json({ 
        error: 'Failed to fetch data from backend',
        details: error.message 
      });
    });
});

// Special root handler to ensure we serve the homepage
app.get('/', (req, res) => {
  console.log('Serving homepage (index.html)');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve HTML files for client-side routing
app.get(['/index.html', '/artists', '/artists.html', '/shops', '/shops.html', 
         '/artist-detail.html', '/shop-detail.html', '/guestspots', '/guestspots.html', 
         '/guestspot-apply.html', '/healthcheck.html'], (req, res) => {
  
  // Map the URL path to the corresponding HTML file
  let fileName = 'index.html';
  if (req.path !== '/index.html') {
    fileName = req.path.endsWith('.html') 
      ? req.path.substring(1) 
      : `${req.path.substring(1)}.html`;
  }
  
  console.log(`Serving HTML file: ${fileName}`);
  res.sendFile(path.join(__dirname, 'public', fileName));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    name: 'Ink Master Link - Tattoo Artist & Shop Directory'
  });
});

// Add static file serving last to ensure our manual routes take precedence
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route - serve index.html for any route that wasn't handled above
app.get('*', (req, res) => {
  console.log('Fallback route handler - serving index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ink Master Link server running on port ${PORT}`);
  console.log(`Server time: ${new Date().toISOString()}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Server should be accessible at: http://localhost:${PORT} and your Replit domain`);
  
  // Print environment info for debugging
  try {
    const repl_owner = process.env.REPL_OWNER || 'unknown';
    const repl_slug = process.env.REPL_SLUG || 'unknown';
    console.log(`Replit public URL: https://${repl_slug}.${repl_owner}.repl.co`);
  } catch (err) {
    console.log('Unable to determine Replit public URL');
  }
});