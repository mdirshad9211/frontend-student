const { createApp } = require('./app');
const { connectDB } = require('./config/db');
const { validateEnvForStartup, env } = require('./config/env');
const { scheduleDeadlineReminder } = require('./jobs/deadlineReminder.job');

async function start() {
  validateEnvForStartup();
  await connectDB(env.MONGO_URI);

  const app = createApp();

  scheduleDeadlineReminder();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

start().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', e);
  process.exit(1);
});

