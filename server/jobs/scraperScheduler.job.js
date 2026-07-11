const cron = require('node-cron');
const { runSarkariScraper } = require('../services/sarkariScraper.service');

async function runScraperOnce() {
  try {
    const result = await runSarkariScraper({ limit: 60 });
    // eslint-disable-next-line no-console
    console.log('Scheduled SarkariResult scrape completed:', result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Scheduled SarkariResult scrape failed:', e.message);
  }
}

function scheduleScraper() {
  // 08:00 AM every day
  cron.schedule('0 8 * * *', runScraperOnce);
  // 12:00 PM (noon) every day
  cron.schedule('0 12 * * *', runScraperOnce);
}

module.exports = { scheduleScraper, runScraperOnce };
