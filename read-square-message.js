const puppeteer = require('puppeteer');

const randomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const browserPromise = puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

async function readSquareMessages(url) {
  const browser = await browserPromise
  const page = await browser.newPage();

  await page.goto(url, {waitUntil: 'networkidle2', timeout: 60000});
  await page.screenshot({ path: `images/${randomString()}.jpg`, fullPage: true });
}

module.exports = readSquareMessages;