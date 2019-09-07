const puppeteer = require('puppeteer');
const moment = require('moment');

const randomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const browserPromise = puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

async function readSquareMessages(url) {
  const browser = await browserPromise
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  const data = await parseSquarePage(page)
  console.log(data)

  const { dateOfPurchase, merchantName, price } = data;
  const fileName = `images/${dateOfPurchase}__${merchantName}__${price}.jpg`
  await page.screenshot({ path: `${fileName}`, fullPage: true });
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