const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { isDualModeFallback } = require('./config/supabase');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const donationRoutes = require('./routes/donationRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite dev server and external clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    platform: 'ReByte Systems (Mumbai University / VIVA Institute of Technology)',
    status: 'ONLINE',
    port: PORT,
    database_mode: isDualModeFallback ? 'Local In-Memory Dual-Mode Fallback' : 'Supabase PostgreSQL Production',
    timestamp: new Date().toISOString()
  });
});

// Interactive Visual API Explorer at GET /api
app.get('/api', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>ReByte API Explorer & Console</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0b0f17; color: #f1f5f9; font-family: 'Plus Jakarta Sans', sans-serif; padding: 2rem 1.5rem; line-height: 1.6; }
        .container { max-width: 1000px; margin: 0 auto; }
        .header { background: #151b28; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 2rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap: 1rem; }
        .badge { font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 4px 10px; border-radius: 999px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25); }
        .btn-ui { background: #2563eb; color: #fff; text-decoration: none; padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .btn-ui:hover { background: #1d4ed8; }
        .grid { display: grid; gap: 1.25rem; }
        .card { background: #151b28; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.5rem; transition: border-color 0.2s; }
        .card:hover { border-color: rgba(59, 130, 246, 0.35); }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .method { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
        .method.get { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .method.post { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .method.patch { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .endpoint { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #f1f5f9; font-weight: 600; }
        .desc { font-size: 13px; color: #94a3b8; margin-bottom: 1rem; }
        .test-btn { background: #1e293b; color: #f1f5f9; border: 1px solid rgba(255,255,255,0.1); padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600; font-family: inherit; }
        .test-btn:hover { background: #232d42; border-color: #38bdf8; }
        .response-box { display: none; margin-top: 1rem; background: #0b0f17; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #cbd5e1; max-height: 250px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <h1 style="font-size: 20px; font-weight: 700;">ReByte Backend API Engine</h1>
              <span class="badge">Port 5000 • ONLINE</span>
            </div>
            <p style="font-size: 13px; color: #94a3b8;">RESTful JSON API for Mumbai University / VIVA Institute ECE Department.</p>
          </div>
          <div>
            <a href="/" class="btn-ui">Open Graphical UI ↗</a>
          </div>
        </div>

        <div class="grid">
          <!-- Item 1 -->
          <div class="card">
            <div class="card-top">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="method get">GET</span>
                <span class="endpoint">/api/health</span>
              </div>
              <button class="test-btn" onclick="runTest(this, '/api/health', 'GET')">Execute Test</button>
            </div>
            <div class="desc">System health check, active database mode, and server status.</div>
            <div class="response-box"></div>
          </div>

          <!-- Item 2 -->
          <div class="card">
            <div class="card-top">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="method get">GET</span>
                <span class="endpoint">/api/inventory</span>
              </div>
              <button class="test-btn" onclick="runTest(this, '/api/inventory', 'GET')">Execute Test</button>
            </div>
            <div class="desc">Hardware catalog listing (ESP32, Uno, Raspberry Pi, Sensors) with pricing & live stock counts.</div>
            <div class="response-box"></div>
          </div>

          <!-- Item 3 -->
          <div class="card">
            <div class="card-top">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="method post">POST</span>
                <span class="endpoint">/api/auth/login</span>
              </div>
              <button class="test-btn" onclick="runTest(this, '/api/auth/login', 'POST', { email: 'admin@viva.edu.in', password: 'admin123' })">Test Faculty Login</button>
            </div>
            <div class="desc">Authenticates faculty admin, generates JWT bearer token, and writes an entry to Login Audit History.</div>
            <div class="response-box"></div>
          </div>

          <!-- Item 4 -->
          <div class="card">
            <div class="card-top">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="method get">GET</span>
                <span class="endpoint">/api/admin/audits/logins</span>
              </div>
              <button class="test-btn" onclick="runTest(this, '/api/admin/audits/logins', 'GET', null, true)">Test Audit Logs (With Auth)</button>
            </div>
            <div class="desc">Queryable security audit trail logging IP address, user agent, timestamps, and authentication statuses.</div>
            <div class="response-box"></div>
          </div>

          <!-- Item 5 -->
          <div class="card">
            <div class="card-top">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="method get">GET</span>
                <span class="endpoint">/api/admin/analytics</span>
              </div>
              <button class="test-btn" onclick="runTest(this, '/api/admin/analytics?college_pct=75', 'GET', null, true)">Test Analytics & Revenue Sharing</button>
            </div>
            <div class="desc">High-level KPIs (utilization rate, e-waste diverted kg, student savings ₹) and institutional revenue share.</div>
            <div class="response-box"></div>
          </div>
        </div>
      </div>

      <script>
        async function runTest(btn, url, method, body = null, useAuth = false) {
          btn.innerText = 'Loading...';
          const box = btn.closest('.card').querySelector('.response-box');
          box.style.display = 'block';
          box.innerText = 'Sending request...';

          try {
            const headers = { 'Content-Type': 'application/json' };
            if (useAuth) {
              headers['Authorization'] = 'Bearer admin-mock-token';
            }
            const opts = { method, headers };
            if (body) opts.body = JSON.stringify(body);

            const res = await fetch(url, opts);
            const data = await res.json();
            box.innerText = JSON.stringify(data, null, 2);
          } catch (e) {
            box.innerText = 'Error: ' + e.message;
          } finally {
            btn.innerText = 'Execute Test';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Mount Core API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/projects', projectRoutes);

// Single-Server Production Unified Serving (serves Vite client/dist)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[ReByte] Serving production static bundle from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
} else {
  // If dist doesn't exist yet, show friendly API root
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>ReByte API Server</title></head>
        <body style="font-family: monospace; background: #260701; color: #f5efe6; padding: 2rem;">
          <h1 style="color: #d6ce93;">ReByte Backend API Engine</h1>
          <p>Status: Running on Port ${PORT}</p>
          <p>Database: ${isDualModeFallback ? 'Local Fallback Store' : 'Supabase Live'}</p>
          <p>For UI, run <code>npm run client</code> (Vite dev server) or <code>npm run build</code>.</p>
          <hr style="border: 1px solid rgba(110,66,48,0.35); margin: 1.5rem 0;" />
          <h3>Core Endpoints:</h3>
          <ul>
            <li><code>POST /api/auth/register</code> (Step 1)</li>
            <li><code>POST /api/admin/users/:id/verify</code> (Step 2)</li>
            <li><code>GET  /api/inventory</code> (Step 3)</li>
            <li><code>POST /api/rentals</code> (Step 4 & 5)</li>
            <li><code>PATCH /api/rentals/:id/collect</code> (Step 6)</li>
            <li><code>PATCH /api/rentals/:id/return</code> (Step 7)</li>
            <li><code>GET  /api/admin/audits/logins</code> (Login Audit)</li>
          </ul>
        </body>
      </html>
    `);
  });
}

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`  REBYTE Core API Server`);
    console.log(`  Listening on: http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Database Mode: ${isDualModeFallback ? 'Dual-Mode Local Fallback' : 'Supabase Live'}`);
    console.log(`=================================================\n`);
  });
}

module.exports = app;
