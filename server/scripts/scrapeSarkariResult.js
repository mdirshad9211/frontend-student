/* eslint-disable no-console */
const { connectDB } = require('../config/db');
const { env } = require('../config/env');
const { runSarkariScraper } = require('../services/sarkariScraper.service');

async function main() {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI not configured');
  }
  await connectDB(env.MONGO_URI);

  const limit = Number(process.env.SARKARI_LIMIT || '40');
  const result = await runSarkariScraper({ limit });
  console.log('Scrape complete:', result);
  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

