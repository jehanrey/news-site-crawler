const browserObject = require('./browser')
const scrapeController = require('./controller')
const {
  booksContext,
  philippineNewsAgencyContext,
  rapplerContext,
  inquirerContext,
} = require('./contexts')

let browserInstance = browserObject.startBrowser()
const url = "https://www.inquirer.net/search?q=online%20selling#gsc.tab=0&gsc.q=online%20selling&gsc.page=1"
const keyword = 'online+selling'

// this is async so you can  actually loop through an array of data
scrapeController({
  url,
  browserInstance,
  context: inquirerContext,
  keyword,
})