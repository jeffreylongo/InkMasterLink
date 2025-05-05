const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Basic middleware
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Simple logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Specific API endpoints with direct mapping
app.get('/api/artists', async (req, res) => {
  try {
    console.log('Fetching artists from backend API');
    const response = await axios.get(`${BACKEND_URL}/api/artists`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching artists: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

app.get('/api/parlors', async (req, res) => {
  try {
    console.log('Fetching parlors from backend API');
    const response = await axios.get(`${BACKEND_URL}/api/parlors`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching parlors: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch parlors' });
  }
});

app.get('/api/shops', async (req, res) => {
  try {
    console.log('Mapping shops request to parlors API endpoint');
    const response = await axios.get(`${BACKEND_URL}/api/parlors`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching shops: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

app.get('/api/guestspots', async (req, res) => {
  try {
    console.log('Fetching guestspots from backend API');
    const response = await axios.get(`${BACKEND_URL}/api/guestspots`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching guestspots: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch guestspots' });
  }
});

// Generic API proxy for other endpoints
app.use('/api', async (req, res) => {
  try {
    // Remove /api from the path when forwarding to backend
    const path = req.url;
    const targetUrl = `${BACKEND_URL}/api${path}`;
    console.log(`Proxying request to: ${targetUrl}`);
    
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.method !== 'GET' ? req.body : undefined,
      headers: { 'Content-Type': 'application/json' }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Proxy error: ${error.message}`);
    res.status(error.response?.status || 500).json({
      error: 'Backend request failed',
      message: error.message
    });
  }
});

// Serve static files from public directory
app.use(express.static('public'));

// Handle specific routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route for HTML pages
app.get('/:page', (req, res) => {
  const page = req.params.page;
  // Add .html extension if not already present
  const fileName = page.endsWith('.html') ? page : `${page}.html`;
  const filePath = path.join(__dirname, 'public', fileName);
  
  // Send the requested file or fallback to index.html
  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ink Master Link server running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Server time: ${new Date().toISOString()}`);
  console.log(`Server is accessible at http://localhost:${PORT}`);
});