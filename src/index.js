const browserObject = require('./browser')
const scrapeController = require('./controller')
const {
  booksContext,
  philippineNewsAgencyContext,
  rapplerContext,
  inquirerContext,
} = require('./contexts')

let browserInstance = browserObject.startBrowser()
// const url = "https://www.inquirer.net/search?q=ecommerce#gsc.tab=0&gsc.q=ecommerce&gsc.page=1"
// const url = "https://www.inquirer.net/search?q=ridesharing#gsc.tab=0&gsc.q=ridesharing&gsc.page=1"
// const url = "https://www.inquirer.net/search?q=grab#gsc.tab=0&gsc.q=grab&gsc.page=1"
// const url = "https://www.pna.gov.ph/articles/search?q=ridesharing"
// const url = "https://www.pna.gov.ph/articles/search?q=ecommerce&c="
// const url = "https://www.pna.gov.ph/articles/search?q=grab+philippines&c="
// const url = "https://www.rappler.com/search?q=ridesharing"
// const url = "https://www.rappler.com/search?q=ecommerce"
const url = "https://www.rappler.com/search?q=grab"

scrapeController({
  url,
  browserInstance,
  context: rapplerContext,
})