const booksScraper = require('./books')
const philippineNewsAgencyScraper = require('./philippine-news-agency')
const rapplerScraper = require('./rappler')

const scraperMap = {
  'books': booksScraper,
  'philippine-news-agency': philippineNewsAgencyScraper,
  'rappler': rapplerScraper,
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

  let data = await scraperFn(scraperProps)
  
  console.log(data)
  console.log(`count: ${counter}`)

  return data
}

module.exports = scraper