const puppeteer = require('puppeteer');
const moment = require('moment');
const Promise = require('bluebird');
const genericPool = require('generic-pool')

const browserPromise = puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

/**
 * Step 1 - Create pool using a factory object
 */
const factory = {
  async create() {
    const browser = await browserPromise
    const page = await browser.newPage(); 
    return page
  },
  async destroy() {
    return await page.close()
  }
};

const pagePool = genericPool.createPool(factory, { min: 3, max: 10 });

async function readSquareMessages(url) {
  const page = await pagePool.acquire();

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  const data = await parseSquarePage(page)
  console.log(data)

  const { dateOfPurchase, merchantName, price } = data;
  const fileName = `images/${dateOfPurchase}__${merchantName}__${price}.jpg`
  await page.screenshot({ path: `${fileName}`, fullPage: true });

  await pagePool.release(page)
  await Promise.delay(Math.floor(Math.random() * 1000) + 1000)
}

async function parseSquarePage(page) {

  const textOfSelector = (selector) => page.$eval(selector, node => node.innerText);

  const merchantName = (await textOfSelector('.merchant-header__name')).replace('(Square Terminal)', '').trim()

  const dateString = await textOfSelector('.td-payment-time')
  const dateOfPurchase = moment(dateString, 'MMM D YYYY').format('YYYY-MM-DD')

  const priceText = (await textOfSelector('.purchase-total')).replace('$', '')
  const price = Number(priceText)

  return {
    merchantName,
    dateOfPurchase,
    price
  }
}

module.exports = readSquareMessages;