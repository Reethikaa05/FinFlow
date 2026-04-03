const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { initDb } = require('./config/database');
const swaggerSpec = require('./utils/swagger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: { success: false, error: 'Too many requests' } });
app.use('/api/', limiter);

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `.swagger-ui .topbar { background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%); border-bottom: 1px solid #e2e8f0; }
    .swagger-ui .topbar-wrapper::before { content: '⚡ FinFlow API'; color: #059669; font-size: 1.4rem; font-weight: 700; letter-spacing: 2px; }
    .swagger-ui .topbar-wrapper img { display: none; }
    body { background: #ffffff; }
    .swagger-ui .info .title { color: #1e293b; }
    .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info table { color: #475569; }
    .swagger-ui .scheme-container { background: #f8fafc; box-shadow: none; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .swagger-ui .opblock-tag { color: #1e293b; border-bottom: 1px solid #f1f5f9; }
    .swagger-ui .opblock .opblock-summary-method { border-radius: 6px; font-weight: 700; text-transform: uppercase; }
    .swagger-ui .btn.authorize { color: #059669; border-color: #059669; }
    .swagger-ui .btn.authorize svg { fill: #059669; }`,
  customSiteTitle: 'FinFlow API Docs',
  swaggerOptions: { persistAuthorization: true, docExpansion: 'list' }
}));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'FinFlow API is running', version: '1.0.0', timestamp: new Date().toISOString(), uptime: Math.round(process.uptime()) });
});

const start = async () => {
  await initDb();
  // Mount routes AFTER db init (before 404 handler!)
  const routes = require('./routes');
  app.use('/api', routes);
  
  // 404 handler (AFTER routes)
  app.use((req, res, next) => {
    res.status(404).json({ success: false, error: `Route ${req.method} ${req.url} not found` });
  });
  
  // Error handler (last middleware)
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
  });
  
  app.listen(PORT, () => {
    console.log(`\n🚀 FinFlow API       → http://localhost:${PORT}/api`);
    console.log(`📚 Swagger Docs      → http://localhost:${PORT}/api/docs`);
    console.log(`💚 Health Check      → http://localhost:${PORT}/api/health`);
    console.log(`\n  Admin:   admin@finflow.com  / admin123`);
    console.log(`  Analyst: sarah@finflow.com  / password123`);
    console.log(`  Viewer:  john@finflow.com   / password123\n`);
  });
};

start().catch(console.error);
module.exports = app;
