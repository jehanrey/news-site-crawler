const scraper = require('./scraper')
const writeFile = require('./utils/file-writer')

async function scrapeController ({
  url,
  browserInstance,
  context,
  keyword,
}) {
  let browser
  try {
    browser = await browserInstance
    let data = {}
    data[context] = await scraper({
      url,
      browser,
      context,
    })
    await browser.close()
    writeFile(data, { context, keyword })
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err)
  }
}

module.exports = scrapeController