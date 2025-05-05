const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log('Starting Angular development server on port 3000...');

// Create a simple HTTP server on port 3000
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ink Link - Loading...</title>
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
        }
        .loader {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 2s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h1 {
          margin-bottom: 15px;
        }
      </style>
    </head>
    <body>
      <div class="loader"></div>
      <h1>Ink Link</h1>
      <p>Connecting tattoo artists and parlors...</p>
      <p>The application is starting up. Please wait.</p>
    </body>
    </html>
  `);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Temporary server running at http://0.0.0.0:3000/');
  console.log('This server will be replaced by the Angular application when it starts.');
});

process.on('SIGINT', () => {
  server.close();
  process.exit();
});