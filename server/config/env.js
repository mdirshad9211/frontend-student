const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

function validateEnvForStartup() {
  if (env.NODE_ENV === 'production') {
    requireEnv('MONGO_URI');
    requireEnv('JWT_SECRET');
  } else {
    if (!env.MONGO_URI) {
      env.MONGO_URI = 'mongodb://127.0.0.1:27017/gov_exam_tracker';
      // eslint-disable-next-line no-console
      console.warn('[env] MONGO_URI missing, using local default mongodb://127.0.0.1:27017/gov_exam_tracker');
    }
    if (!env.JWT_SECRET) {
      env.JWT_SECRET = 'dev_only_change_me';
      // eslint-disable-next-line no-console
      console.warn('[env] JWT_SECRET missing, using development fallback secret');
    }
  }
  // EMAIL_* optional for local dev (we'll log instead of sending)
  return env;
}

module.exports = { env, validateEnvForStartup };

