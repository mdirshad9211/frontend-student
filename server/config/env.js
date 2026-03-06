const dotenv = require('dotenv');

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
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

function validateEnvForStartup() {
  requireEnv('MONGO_URI');
  requireEnv('JWT_SECRET');
  // EMAIL_* optional for local dev (we'll log instead of sending)
  return env;
}

module.exports = { env, validateEnvForStartup };

