const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { env } = require('./config/env');
const { ApiError } = require('./utils/ApiError');
const { apiRateLimiter } = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { sanitizeRequest, preventParameterPollution } = require('./middlewares/security');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const examsRoutes = require('./routes/exams.routes');
const userExamsRoutes = require('./routes/userExams.routes');
const adminRoutes = require('./routes/admin.routes');
const siteRoutes = require('./routes/site.routes');
const updatesRoutes = require('./routes/updates.routes');

function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    hsts: env.NODE_ENV === 'production' ? { maxAge: 15552000, includeSubDomains: true } : false,
  }));
  app.use(
    cors({
      origin(origin, callback) {
        const allowedOrigins = new Set([env.CLIENT_URL, 'https://www.sarkora.in', 'https://sarkora.in']);
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new ApiError(403, 'Origin not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      maxAge: 86400,
    })
  );

  if (env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  app.use(express.json({ limit: '100kb', type: 'application/json' }));
  app.use(express.urlencoded({ extended: false, limit: '25kb' }));
  app.use(sanitizeRequest);
  app.use(preventParameterPollution);
  app.use(apiRateLimiter);

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, env: env.NODE_ENV });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/exams', examsRoutes);
  app.use('/api', updatesRoutes);
  app.use('/api/user-exams', userExamsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', siteRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };



