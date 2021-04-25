const booksScraper = require('./books')
const inquirerScraper = require('./inquirer')
const philippineNewsAgencyScraper = require('./philippine-news-agency')
const rapplerScraper = require('./rappler')

const scraperMap = {
  'books': booksScraper,
  'philippine-news-agency': philippineNewsAgencyScraper,
  'rappler': rapplerScraper,
  'inquirer': inquirerScraper
}

const scraper = async ({
  url,
  browser,
  context,
}) => {
  let page = await browser.newPage()
  let counter = 0
  let scrapedData = []

  console.log(`Navigating to ${url}...`)
  await page.goto(url)

  const scraperFn = scraperMap[context]
  const scraperProps = {
    browser,
    page,
    counter,
    scrapedData,
  }

  let { data, count } = await scraperFn(scraperProps)

  console.log(data)
  console.log(`count: ${count}`)

  return data
}

module.exports = scraper