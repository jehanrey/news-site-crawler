const browserObject = require('./browser')
const { scrapeBooksFn, scrapePnaNewsFn, scrapeRapplerNewsFn } = require('./page-controller')

//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser()

// Pass the browser instance to the scraper controller
// scrapeBooksFn(browserInstance)
// scrapePnaNewsFn(browserInstance)
scrapeRapplerNewsFn(browserInstance)