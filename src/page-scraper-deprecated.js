const booksScraper = {
  url: "http://books.toscrape.com",

  async scraper(browser, category) {
    let page = await browser.newPage()

    console.log(`Navigating to ${this.url}...`)
    await page.goto(this.url)

    // Select the category of book to be displayed
    let selectedCategory = await page.$$eval('.side_categories > ul > li > ul > li > a', (links, _category) => {
      // Search for the element that has the matching text
      links = links.map(a => a.textContent.replace(/(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm, "") === _category ? a : null)
      let link = links.filter(tx => tx !== null)[0]
      return link.href
    }, category)

    // Navigate to the selected category
    await page.goto(selectedCategory)

    let scrapedData = []

    async function scrapeCurrentPage() {
      // Wait for the required DOM to be rendered
      await page.waitForSelector(".page_inner")

      // Get the link to all the required books
      let urls = await page.$$eval("section ol > li", (links) => {
        // Make sure the book to be scraped is in stock
        links = links.filter((link) => link.querySelector(".instock.availability > i").textContent !== "In stock")
        // Extract the links from the data
        links = links.map((el) => el.querySelector("h3 > a").href)
        return links
      })

      let pagePromise = (link) => new Promise(async (resolve, reject) => {
        let dataObj = {}
        let newPage = await browser.newPage()
        await newPage.goto(link)
        dataObj["bookTitle"] = await newPage.$eval(".product_main > h1", (text) => text.textContent)
        dataObj["bookPrice"] = await newPage.$eval(".price_color", (text) => text.textContent)
        dataObj["noAvailable"] = await newPage.$eval(".instock.availability", (text) => {
          // Strip new line and tab spaces
          text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "")
          // Get the number of stock available
          let regexp = /^.*\((.*)\).*$/i
          let stockAvailable = regexp.exec(text)[1].split(" ")[0]
          return stockAvailable
        })
        dataObj["imageUrl"] = await newPage.$eval("#product_gallery img", (img) => img.src)
        dataObj["bookDescription"] = await newPage.$eval("#product_description", (div) => div.nextSibling.nextSibling.textContent)
        dataObj["upc"] = await newPage.$eval(".table.table-striped > tbody > tr > td", (table) => table.textContent)
        resolve(dataObj)
        await newPage.close()
      })

      // Loop through each of those links, open a new page instance and get the relevant data from them
      for (link in urls) {
        let currentPageData = await pagePromise(urls[link])
        scrapedData.push(currentPageData)
      }

      // When all the data on this page is done, click the next button and start the scraping of the next page
      // You are going to check if this button exist first, so you know if there really is a next page.
      let nextButtonExist = false
      try {
        const nextButton = await page.$eval(".next > a", (a) => a.textContent)
        nextButtonExist = true
      } catch (err) {
        nextButtonExist = false
      }
      if (nextButtonExist) {
        await page.click(".next > a")
        return scrapeCurrentPage() // Call this function recursively
      }
      await page.close()
      return scrapedData
    }

    let data = await scrapeCurrentPage()
    console.log(data)
    return data
  },
}

const pnaNewsScraper = {
  // url: "https://www.pna.gov.ph/articles/search?q=ridesharing&c=",
  // url: "https://www.pna.gov.ph/articles/search?q=grab+philippines&c=",
  url: "https://www.pna.gov.ph/articles/search?q=ecommerce&c=",

  async scraper (browser) {
    let page = await browser.newPage()
    let counter = 0

    console.log(`Navigating to ${this.url}...`)
    await page.goto(this.url)

    let scrapedData = []

    async function scrapeCurrentPage() {
      // Wait for the required DOM to be rendered
      await page.waitForSelector(".template-pna")

      let pagePromise = (link) => new Promise(async (resolve, reject) => {
        let dataObj = {}
        let newPage = await browser.newPage()
        await newPage.goto(link)
        dataObj["title"] = await newPage.$eval(".page-header > h1", (text) => text.textContent)
        dataObj["date"] = await newPage.$eval(".page-header .date", (text) => text.textContent)
        dataObj["snippet"] = await newPage.$eval(".page-content > p", (text) => {
          return text.textContent.split('--')[1] ? text.textContent.split('--')[1].trim() : text.textContent.split('--')[0].trim()
        }).catch(async () => {
          dataObj["snippet"] = await newPage.$eval(".page-content > div", (text) => {
            return text.textContent.split('--')[1] ? text.textContent.split('--')[1].trim() : text.textContent.split('--')[0].trim()
          })
        })
        dataObj["body"] = await newPage.$eval(".page-content", (el) => {
          const childNodes = el.children
          let contents = []
          for (let item of childNodes) {
            if (item.nodeName === 'P' || item.nodeName === 'DIV') {
              contents.push(item.textContent.replace(/(\s\r\n\t|\n|\r|\t|&nbsp;|<br>|<br \/>)/gm, "").trim())
            }
          }
          return contents.join(' ')
        })
        resolve(dataObj)
        counter = counter + 1
        await newPage.close()
      })

      // Get the link to all the required books
      let urls = await page.$$eval(".articles > .article > .media-body", (links) => {
        // Extract the links from the data
        links = links.map((el) => el.querySelector("h3 > a").href)
        return links
      })

      // Loop through each of those links, open a new page instance and get the relevant data from them
      for (link in urls) {
        let currentPageData = await pagePromise(urls[link])
        scrapedData.push(currentPageData)
      }

      // When all the data on this page is done, click the next button and start the scraping of the next page
      // You are going to check if this button exist first, so you know if there really is a next page.
      let nextButtonExist = false
      let nextButton = ''
      try {
        nextButton = await page.$eval(".pagination-area > .pagination > li:nth-last-child(2):not(.disabled) > a", (a) => a.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "").trim())
        nextButtonExist = nextButton == '›'
      } catch (err) {
        nextButtonExist = false
      }

      if (nextButtonExist) {
        await page.click(".pagination-area > .pagination > li:nth-last-child(2):not(.disabled) > a")
        return scrapeCurrentPage() // Call this function recursively
      }
      await page.close()

      return scrapedData
    }

    let data = await scrapeCurrentPage()
    console.log(`count: ${counter}`)
    // console.log('data', data)
    return data
  },
}

const rapplerNewsScraper = {
  // url: "https://www.rappler.com/search?q=ninoy",
  // url: "https://www.rappler.com/search?q=ridesharing",
  // url: "https://www.rappler.com/search?q=ecommerce",
  url: 'https://www.rappler.com/search?q=grab',

  async scraper (browser) {
    let page = await browser.newPage()
    let counter = 0

    console.log(`Navigating to ${this.url}...`)
    await page.goto(this.url)

    let scrapedData = []

    async function scrapeCurrentPage() {
      // Wait for the required DOM to be rendered
      await page.waitForSelector('div[data-testid="wrapper"]')

      let pagePromise = (link) => new Promise(async (resolve, reject) => {
        let dataObj = {}
        let newPage = await browser.newPage()
        await newPage.goto(link)
        dataObj["title"] = await newPage.$eval(".copy-block > h1", (text) => text.textContent).catch(() => '')
        dataObj["date"] = await newPage.$eval(".time-header > time", (text) => text.textContent).catch(() => '')
        dataObj["snippet"] = await newPage.$eval('div[class*="ArticleBodyWrapper"] .excerpt p.summary', (text) => {
          return text.textContent.trim()
        }).catch(() => '')
        dataObj["body"] = await newPage.$$eval('div[class*="StyleComponents__ParagraghWrapper"]', (paragraphs) => {
          paragraphs = paragraphs.map((el) => el.querySelector('p').textContent)
          return paragraphs.join(' ')
        }).catch(() => '')
        resolve(dataObj)
        counter = counter + 1
        await newPage.close()
      })

      // Load all articles first
      let loadMoreExists = false
      let loadMoreButton = ''
      try {
        loadMoreButton = await page.$eval('button[data-testid="load-more-btn"]', (a) => a.textContent)
        loadMoreExists = !!loadMoreButton
      } catch (err) {
        loadMoreExists = false
      }

      if (loadMoreExists) {
        const loadMoreSelector = 'button[data-testid="load-more-btn"]'
        try { await page.click(loadMoreSelector) } catch (error) {} // sacrifice click  :)
        // await page.waitFor(2000); // time for scrolling
        // await page.click(loadMoreSelector); // this will work
        return scrapeCurrentPage() // Call this function recursively
      }

      // Get the link to all the required books
      let urls = await page.$$eval('div[data-testid="child"]', (links) => {
        // Extract the links from the data
        links = links.map((el) => el.querySelector(".related-content-item").href)
        return links
      })

      // Loop through each of those links, open a new page instance and get the relevant data from them
      for (link in urls) {
        let currentPageData = await pagePromise(urls[link])
        scrapedData.push(currentPageData)
      }

      await page.close()
      return scrapedData
    }

    let data = await scrapeCurrentPage()
    console.log('data', data)
    console.log(`count: ${counter}`)
    return data
  },
}

module.exports = {
  booksScraper,
  pnaNewsScraper,
  rapplerNewsScraper,
}
