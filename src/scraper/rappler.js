async function rapplerScraper ({
  browser,
  page,
  counter,
  scrapedData,
}) {
  let count = counter
  await page.waitForSelector('div[data-testid="wrapper"]')

  let pagePromise = (link) => new Promise(async (resolve, _reject) => {
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
    count = count + 1

    await newPage.close()
  })

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
    try { await page.click(loadMoreSelector) } catch (error) {}
    return rapplerScraper({
      browser,
      page,
      counter: count,
      scrapedData,
    })
  }

  let urls = await page.$$eval('div[data-testid="child"]', (links) => {
    links = links.map((el) => el.querySelector(".related-content-item").href)
    return links
  })

  for (link in urls) {
    let currentPageData = await pagePromise(urls[link])
    scrapedData.push(currentPageData)
  }

  await page.close()
  return scrapedData
}

module.exports = rapplerScraper