// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (optional, useful for development)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Node.js Server is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /': 'Server status',
      'GET /api/force-browser': 'Force browser redirect endpoint'
    }
  });
});

// Force browser redirect API endpoint
app.get('/api/force-browser', (req, res) => {
  const redirectUrl = req.query.redirectUrl;
  
  if (!redirectUrl) {
    return res.status(400).json({
      error: 'Missing redirectUrl parameter',
      message: 'Please provide a redirectUrl query parameter'
    });
  }

  // Validate URL format (basic validation)
  try {
    new URL(redirectUrl);
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid URL format',
      message: 'Please provide a valid URL'
    });
  }

  // Set headers to force download and open in native browser
  res.setHeader('Content-Disposition', 'attachment; filename=open.html');
  res.setHeader('Content-Type', 'text/html');
  
  // Send HTML response with auto-redirect
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirecting...</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <script>
          // Immediate redirect
          window.location.href = "${redirectUrl}";
          
          // Fallback redirect after 2 seconds
          setTimeout(function() {
            if (window.location.href !== "${redirectUrl}") {
              window.location.href = "${redirectUrl}";
            }
          }, 2000);
        </script>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>Redirecting...</h2>
          <p>You are being redirected to your destination.</p>
          <p><small>If you are not redirected automatically, 
             <a href="${redirectUrl}">click here</a>.</small></p>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET /',
      'GET /api/force-browser?redirectUrl=<url>',
      'GET /health'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/force-browser?redirectUrl=<url>`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`\n💡 Example usage:`);
  console.log(`   http://localhost:${PORT}/api/force-browser?redirectUrl=https://instagram.com`);
});

module.exports = app;