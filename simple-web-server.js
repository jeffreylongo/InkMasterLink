const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = 'http://localhost:3000';

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Backend API proxy
app.use('/api', async (req, res) => {
  try {
    // Translate shops to parlors for backend
    let backendPath = req.path;
    if (backendPath.startsWith('/shops')) {
      backendPath = backendPath.replace('/shops', '/parlors');
      console.log(`Mapped from ${req.path} to ${backendPath}`);
    }

    // Make the request to backend
    console.log(`Proxying to backend: ${req.method} ${backendPath}`);
    const backendUrl = `${BACKEND_URL}${backendPath}`;
    
    const response = await axios({
      method: req.method,
      url: backendUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error proxying to backend:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'InkrSpace Web Server', 
    time: new Date().toISOString() 
  });
});

// All other routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`InkrSpace web server running on port ${PORT}`);
  console.log(`Server time: ${new Date().toISOString()}`);
});