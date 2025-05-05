const express = require('express');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

// Create the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Serve static files from the frontend/dist directory (if built)
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Create a simple home route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ink Link - Tattoo Artist & Parlor Directory</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f5f5f5;
          color: #333;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          text-align: center;
          padding: 0 20px;
        }
        .logo {
          font-size: 3em;
          margin-bottom: 20px;
          color: #1a1a1a;
        }
        .tagline {
          font-size: 1.5em;
          margin-bottom: 40px;
          color: #555;
        }
        .features {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
          max-width: 1000px;
        }
        .feature {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          width: 250px;
          text-align: left;
        }
        .feature h3 {
          margin-top: 0;
          color: #1a1a1a;
        }
        .button {
          background-color: #4a4a4a;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 10px;
          display: inline-block;
        }
        .button:hover {
          background-color: #2a2a2a;
        }
        footer {
          margin-top: 40px;
          color: #777;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="logo">Ink Link</div>
      <div class="tagline">Connecting Tattoo Artists and Parlors Worldwide</div>
      
      <div class="features">
        <div class="feature">
          <h3>Find Guest Spots</h3>
          <p>Artists can discover and book guest spots at tattoo parlors around the world.</p>
        </div>
        <div class="feature">
          <h3>Artist Directory</h3>
          <p>Browse profiles of talented tattoo artists and view their portfolios.</p>
        </div>
        <div class="feature">
          <h3>Parlor Showcase</h3>
          <p>Discover top-rated tattoo parlors with detailed information and reviews.</p>
        </div>
      </div>
      
      <div>
        <a href="/api" class="button">API Documentation</a>
        <a href="/artists" class="button">Browse Artists</a>
        <a href="/parlors" class="button">Find Parlors</a>
      </div>
      
      <footer>
        &copy; ${new Date().getFullYear()} Ink Link - Tattoo Artist & Parlor Directory
      </footer>
    </body>
    </html>
  `);
});

// API status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ink Link server is running',
    version: '1.0.0'
  });
});

// Proxy API requests to the backend server
app.use('/api', (req, res) => {
  const apiUrl = `http://localhost:3000/api${req.path}`;
  res.redirect(apiUrl);
});

// Route not found - return the SPA
app.get('*', (req, res) => {
  res.redirect('/');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Main server running on port ${PORT}`);
  
  // Start the backend server
  console.log('Starting backend server...');
  const backendServer = spawn('node', ['backend/server.js']);
  
  backendServer.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });
  
  backendServer.stderr.on('data', (data) => {
    console.error(`Backend error: ${data}`);
  });
  
  backendServer.on('close', (code) => {
    console.log(`Backend server process exited with code ${code}`);
  });
});