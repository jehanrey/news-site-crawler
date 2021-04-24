const { booksScraper, pnaNewsScraper, rapplerNewsScraper } = require('./page-scraper')
const fileWriter = require('./file-writer')

async function scrapeBooks (browserInstance) {
    let browser

    try {
      browser = await browserInstance
      let scrapedData = {}
      // Call the scraper for different set of books to be scraped
      scrapedData['Travel'] = await booksScraper.scraper(browser, 'Travel')
      await browser.close()
      fileWriter(scrapedData, 'books')
    } catch (err) {
      console.log('Could not resolve the browser instance => ', err)
    }
}

async function scrapePnaNews (browserInstance) {
  let browser

  try {
    browser = await browserInstance
    let data = {}
    data['pna-news'] = await pnaNewsScraper.scraper(browser)
    await browser.close()
    fileWriter(data, 'pna-news')
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err)
  }
}

async function scrapeRapplerNews (browserInstance) {
  let browser

  try {
    browser = await browserInstance
    let data = {}
    data['rappler-news'] = await rapplerNewsScraper.scraper(browser)
    await browser.close()
    fileWriter(data, 'rappler-news')
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err)
  }
}

const scrapeBooksFn = (browserInstance) => scrapeBooks(browserInstance)

const scrapePnaNewsFn = (browserInstance) => scrapePnaNews(browserInstance)

const scrapeRapplerNewsFn = (browserInstance) => scrapeRapplerNews(browserInstance)

module.exports = {
  scrapeBooksFn,
  scrapePnaNewsFn,
  scrapeRapplerNewsFn,
}