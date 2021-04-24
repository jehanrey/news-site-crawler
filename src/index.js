const browserObject = require('./browser')
const scrapeController = require('./controller')
const {
  booksContext,
  philippineNewsAgencyContext,
  rapplerContext,
} = require('./contexts')

let browserInstance = browserObject.startBrowser()
const url = "https://www.rappler.com/search?q=ridesharing"

scrapeController({
  url,
  browserInstance,
  context: rapplerContext,
})