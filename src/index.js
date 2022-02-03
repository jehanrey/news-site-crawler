const browserObject = require('./browser')
const scrapeController = require('./controller')
const {
  booksContext,
  philippineNewsAgencyContext,
  rapplerContext,
  inquirerContext,
} = require('./contexts')

let browserInstance = browserObject.startBrowser()
const url = 'https://www.rappler.com/?s=grab+food'
const keyword = 'grab food'

// this is async so you can  actually loop through an array of data
scrapeController({
  url,
  browserInstance,
  context: rapplerContext,
  keyword,
})